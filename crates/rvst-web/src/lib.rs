use std::num::NonZeroUsize;

use rvst_core::{NodeId, NodeType, Op};

mod events;
use rvst_engine::{composite, css, layout};
use rvst_text::TextRenderer;
use rvst_tree::Tree;
use vello::{AaConfig, AaSupport, RenderParams, RendererOptions, Scene};
use wasm_bindgen::prelude::*;

/// Embedded default font — baked into the WASM binary at compile time.
/// No network requests needed.
static DEFAULT_FONT: &[u8] = include_bytes!("../assets/SFNS.ttf");

/// The RVST rendering engine for the browser.
/// Holds the tree, CSS engine, text renderer, and GPU renderer.
#[wasm_bindgen]
pub struct RvstEngine {
    tree: Tree,
    css_engine: Option<css::CssEngine>,
    text_renderer: TextRenderer,
    width: u32,
    height: u32,
    next_id: u32,
    // GPU state (initialized async after construction)
    device: Option<wgpu::Device>,
    queue: Option<wgpu::Queue>,
    surface: Option<wgpu::Surface<'static>>,
    surface_config: Option<wgpu::SurfaceConfiguration>,
    vello: Option<vello::Renderer>,
    target_texture: Option<wgpu::Texture>,
    target_view: Option<wgpu::TextureView>,
    // Blit pipeline (Vello Rgba8Unorm → surface)
    blit_pipeline: Option<wgpu::RenderPipeline>,
    blit_bind_group_layout: Option<wgpu::BindGroupLayout>,
    blit_bind_group: Option<wgpu::BindGroup>,
    sampler: Option<wgpu::Sampler>,
}

const BLIT_SHADER: &str = r#"
struct VOut {
    @builtin(position) pos: vec4<f32>,
    @location(0) uv: vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vi: u32) -> VOut {
    let x = f32(i32(vi & 1u) * 4 - 1);
    let y = f32(i32(vi & 2u) * 2 - 1);
    let u = (x + 1.0) * 0.5;
    let v = (1.0 - y) * 0.5;
    return VOut(vec4<f32>(x, y, 0.0, 1.0), vec2<f32>(u, v));
}

@group(0) @binding(0) var tex: texture_2d<f32>;
@group(0) @binding(1) var smp: sampler;

@fragment
fn fs_main(in: VOut) -> @location(0) vec4<f32> {
    return textureSample(tex, smp, in.uv);
}
"#;

#[wasm_bindgen]
impl RvstEngine {
    /// Create a new engine instance (GPU not yet initialized).
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> Self {
        // Set up console logging for wasm
        let _ = console_log::init_with_level(log::Level::Warn);
        let mut text_renderer = TextRenderer::new();
        // Register the embedded font so text renders without any network requests
        text_renderer.register_font(DEFAULT_FONT.to_vec());
        Self {
            tree: Tree::new(),
            css_engine: None,
            text_renderer,
            width,
            height,
            next_id: 100,
            device: None,
            queue: None,
            surface: None,
            surface_config: None,
            vello: None,
            target_texture: None,
            target_view: None,
            blit_pipeline: None,
            blit_bind_group_layout: None,
            blit_bind_group: None,
            sampler: None,
        }
    }

    /// Initialize the GPU renderer with a canvas element. Must be called before render().
    /// This is async because wgpu adapter/device creation requires promises in WASM.
    pub async fn init_gpu(&mut self, canvas: web_sys::HtmlCanvasElement) -> Result<(), JsValue> {
        let w = self.width.max(1);
        let h = self.height.max(1);
        canvas.set_width(w);
        canvas.set_height(h);

        let instance = wgpu::Instance::new(&wgpu::InstanceDescriptor {
            backends: wgpu::Backends::BROWSER_WEBGPU | wgpu::Backends::GL,
            ..Default::default()
        });

        let surface_target = wgpu::SurfaceTarget::Canvas(canvas);
        let surface = instance
            .create_surface(surface_target)
            .map_err(|e| JsValue::from_str(&format!("create_surface: {e}")))?;

        let adapter = instance
            .request_adapter(&wgpu::RequestAdapterOptions {
                compatible_surface: Some(&surface),
                ..Default::default()
            })
            .await;
        let adapter = adapter
            .map_err(|e| JsValue::from_str(&format!("request_adapter: {e}")))?;

        let device_result = adapter
            .request_device(&wgpu::DeviceDescriptor {
                required_features: wgpu::Features::empty(),
                required_limits: wgpu::Limits::downlevel_webgl2_defaults(),
                ..Default::default()
            })
            .await;
        let (device, queue) = match device_result {
            Ok(dq) => dq,
            Err(e) => return Err(JsValue::from_str(&format!("request_device: {e}"))),
        };

        let caps = surface.get_capabilities(&adapter);
        // Use non-sRGB format (Vello outputs sRGB-encoded values already)
        let format = caps
            .formats
            .iter()
            .find(|f| !f.is_srgb())
            .or_else(|| caps.formats.first())
            .copied()
            .ok_or_else(|| JsValue::from_str("no surface format"))?;

        let config = wgpu::SurfaceConfiguration {
            usage: wgpu::TextureUsages::RENDER_ATTACHMENT,
            format,
            width: w,
            height: h,
            present_mode: wgpu::PresentMode::Fifo,
            alpha_mode: caps
                .alpha_modes
                .first()
                .copied()
                .unwrap_or(wgpu::CompositeAlphaMode::Auto),
            view_formats: vec![],
            desired_maximum_frame_latency: 2,
        };
        surface.configure(&device, &config);

        // Vello renderer
        let vello = vello::Renderer::new(
            &device,
            RendererOptions {
                use_cpu: false,
                antialiasing_support: AaSupport::area_only(),
                num_init_threads: NonZeroUsize::new(1),
                pipeline_cache: None,
            },
        )
        .map_err(|e| JsValue::from_str(&format!("vello init: {e}")))?;

        // Vello target texture (Rgba8Unorm — Vello writes sRGB values here)
        let (target_texture, target_view) = create_target(&device, w, h);

        // Blit pipeline: copy Vello target → surface
        let blit_bind_group_layout =
            device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
                label: Some("blit-bgl"),
                entries: &[
                    wgpu::BindGroupLayoutEntry {
                        binding: 0,
                        visibility: wgpu::ShaderStages::FRAGMENT,
                        ty: wgpu::BindingType::Texture {
                            multisampled: false,
                            view_dimension: wgpu::TextureViewDimension::D2,
                            sample_type: wgpu::TextureSampleType::Float { filterable: true },
                        },
                        count: None,
                    },
                    wgpu::BindGroupLayoutEntry {
                        binding: 1,
                        visibility: wgpu::ShaderStages::FRAGMENT,
                        ty: wgpu::BindingType::Sampler(wgpu::SamplerBindingType::Filtering),
                        count: None,
                    },
                ],
            });

        let sampler = device.create_sampler(&wgpu::SamplerDescriptor {
            mag_filter: wgpu::FilterMode::Linear,
            min_filter: wgpu::FilterMode::Linear,
            ..Default::default()
        });

        let blit_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("blit-bg"),
            layout: &blit_bind_group_layout,
            entries: &[
                wgpu::BindGroupEntry {
                    binding: 0,
                    resource: wgpu::BindingResource::TextureView(&target_view),
                },
                wgpu::BindGroupEntry {
                    binding: 1,
                    resource: wgpu::BindingResource::Sampler(&sampler),
                },
            ],
        });

        let blit_pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
            label: Some("blit-layout"),
            bind_group_layouts: &[&blit_bind_group_layout],
            immediate_size: 0,
        });

        let shader = device.create_shader_module(wgpu::ShaderModuleDescriptor {
            label: Some("blit-shader"),
            source: wgpu::ShaderSource::Wgsl(BLIT_SHADER.into()),
        });

        let blit_pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("blit-pipeline"),
            layout: Some(&blit_pipeline_layout),
            vertex: wgpu::VertexState {
                module: &shader,
                entry_point: Some("vs_main"),
                buffers: &[],
                compilation_options: wgpu::PipelineCompilationOptions::default(),
            },
            fragment: Some(wgpu::FragmentState {
                module: &shader,
                entry_point: Some("fs_main"),
                targets: &[Some(wgpu::ColorTargetState {
                    format,
                    blend: None,
                    write_mask: wgpu::ColorWrites::ALL,
                })],
                compilation_options: wgpu::PipelineCompilationOptions::default(),
            }),
            primitive: wgpu::PrimitiveState {
                topology: wgpu::PrimitiveTopology::TriangleList,
                ..Default::default()
            },
            depth_stencil: None,
            multisample: wgpu::MultisampleState::default(),
            multiview_mask: None,
            cache: None,
        });

        self.device = Some(device);
        self.queue = Some(queue);
        self.surface = Some(surface);
        self.surface_config = Some(config);
        self.vello = Some(vello);
        self.target_texture = Some(target_texture);
        self.target_view = Some(target_view);
        self.blit_pipeline = Some(blit_pipeline);
        self.blit_bind_group_layout = Some(blit_bind_group_layout);
        self.blit_bind_group = Some(blit_bind_group);
        self.sampler = Some(sampler);

        Ok(())
    }

    /// Load a font from raw TTF/OTF bytes.
    pub fn load_font(&mut self, data: &[u8]) {
        self.text_renderer.register_font(data.to_vec());
    }

    /// Load a CSS stylesheet.
    pub fn load_css(&mut self, css_text: &str) {
        let mut engine = css::CssEngine::new();
        engine.load_css(css_text);
        self.css_engine = Some(engine);
    }

    /// Create an element node and return its ID.
    pub fn create_node(&mut self, tag: &str) -> u32 {
        let id = self.next_id;
        self.next_id += 1;
        let node_type = match tag {
            "input" => NodeType::Input,
            "textarea" => NodeType::Textarea,
            "button" => NodeType::Button,
            "form" => NodeType::Form,
            _ => NodeType::View,
        };
        self.tree.apply(Op::CreateNode {
            id: NodeId(id),
            node_type,
        });
        id
    }

    /// Create a text node and return its ID.
    pub fn create_text_node(&mut self, text: &str) -> u32 {
        let id = self.next_id;
        self.next_id += 1;
        self.tree.apply(Op::CreateNode {
            id: NodeId(id),
            node_type: NodeType::Text,
        });
        self.tree.apply(Op::SetText {
            id: NodeId(id),
            value: text.into(),
        });
        id
    }

    /// Set a style property on a node.
    pub fn set_style(&mut self, id: u32, key: &str, value: &str) {
        if let Some(node) = self.tree.nodes.get_mut(&NodeId(id)) {
            node.styles.insert(key.to_string(), value.to_string());
        }
    }

    /// Set text content on a text node.
    pub fn set_text(&mut self, id: u32, text: &str) {
        self.tree.apply(Op::SetText {
            id: NodeId(id),
            value: text.into(),
        });
    }

    /// Insert a child into a parent, optionally before an anchor.
    pub fn insert(&mut self, parent_id: u32, child_id: u32, anchor_id: Option<u32>) {
        self.tree.apply(Op::Insert {
            parent: NodeId(parent_id),
            child: NodeId(child_id),
            anchor: anchor_id.map(NodeId),
        });
    }

    /// Remove a child from its parent.
    pub fn remove(&mut self, child_id: u32) {
        self.tree.apply(Op::Remove {
            id: NodeId(child_id),
        });
    }

    /// Set an attribute on a node.
    pub fn set_attribute(&mut self, id: u32, key: &str, value: &str) {
        if let Some(node) = self.tree.nodes.get_mut(&NodeId(id)) {
            node.styles.insert(key.to_string(), value.to_string());
        }
    }

    /// Apply CSS cascade, compute layout, build scene, and render to the canvas.
    pub fn render(&mut self) -> Result<(), JsValue> {
        // CSS cascade
        if let Some(ref engine) = self.css_engine {
            engine.apply_to_tree(&mut self.tree);
        }

        // Layout
        let roots: Vec<NodeId> = self.tree.root_children.clone();
        layout::flow(
            &mut self.tree,
            &roots,
            &mut self.text_renderer,
            self.width as f32,
            self.height as f32,
            1.0,
            None,
        );

        // Build Vello scene
        let scene = composite::build_scene(
            &self.tree,
            &roots,
            &mut self.text_renderer,
            self.width,
            self.height,
            1.0,
        );

        // Render to GPU
        let device = self.device.as_ref().ok_or("GPU not initialized")?;
        let queue = self.queue.as_ref().ok_or("GPU not initialized")?;
        let vello = self.vello.as_mut().ok_or("GPU not initialized")?;
        let target_view = self.target_view.as_ref().ok_or("GPU not initialized")?;
        let surface = self.surface.as_ref().ok_or("GPU not initialized")?;
        let blit_pipeline = self.blit_pipeline.as_ref().ok_or("GPU not initialized")?;
        let blit_bind_group = self.blit_bind_group.as_ref().ok_or("GPU not initialized")?;

        let params = RenderParams {
            base_color: peniko::Color::from_rgba8(20, 20, 26, 255),
            width: self.width,
            height: self.height,
            antialiasing_method: AaConfig::Area,
        };

        vello
            .render_to_texture(device, queue, &scene, target_view, &params)
            .map_err(|e| JsValue::from_str(&format!("vello render: {e}")))?;

        // Blit to surface
        let output = surface
            .get_current_texture()
            .map_err(|e| JsValue::from_str(&format!("get_texture: {e}")))?;
        let surface_view = output
            .texture
            .create_view(&wgpu::TextureViewDescriptor::default());

        let mut encoder = device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
            label: Some("blit-encoder"),
        });
        {
            let mut pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                label: Some("blit-pass"),
                color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                    view: &surface_view,
                    resolve_target: None,
                    depth_slice: None,
                    ops: wgpu::Operations {
                        load: wgpu::LoadOp::Clear(wgpu::Color::BLACK),
                        store: wgpu::StoreOp::Store,
                    },
                })],
                depth_stencil_attachment: None,
                timestamp_writes: None,
                occlusion_query_set: None,
                multiview_mask: None,
            });
            pass.set_pipeline(blit_pipeline);
            pass.set_bind_group(0, blit_bind_group, &[]);
            pass.draw(0..3, 0..1);
        }

        queue.submit(std::iter::once(encoder.finish()));
        output.present();

        Ok(())
    }

    /// Resize the viewport.
    pub fn resize(&mut self, width: u32, height: u32) {
        let w = width.max(1);
        let h = height.max(1);
        self.width = w;
        self.height = h;

        if let (Some(device), Some(surface), Some(config)) = (
            self.device.as_ref(),
            self.surface.as_ref(),
            self.surface_config.as_mut(),
        ) {
            config.width = w;
            config.height = h;
            surface.configure(device, config);

            let (tex, view) = create_target(device, w, h);
            self.target_texture = Some(tex);
            self.target_view = Some(view);

            // Rebuild blit bind group with new view
            if let (Some(layout), Some(sampler)) = (
                self.blit_bind_group_layout.as_ref(),
                self.sampler.as_ref(),
            ) {
                self.blit_bind_group = Some(device.create_bind_group(&wgpu::BindGroupDescriptor {
                    label: Some("blit-bg"),
                    layout,
                    entries: &[
                        wgpu::BindGroupEntry {
                            binding: 0,
                            resource: wgpu::BindingResource::TextureView(
                                self.target_view.as_ref().unwrap(),
                            ),
                        },
                        wgpu::BindGroupEntry {
                            binding: 1,
                            resource: wgpu::BindingResource::Sampler(sampler),
                        },
                    ],
                }));
            }
        }
    }

    /// Get the total node count.
    pub fn node_count(&self) -> u32 {
        self.tree.nodes.len() as u32
    }

    /// Get the root node ID.
    pub fn root_id(&self) -> u32 {
        0
    }

    /// Set up browser input event listeners (click, mousemove, keydown, keyup, wheel)
    /// on the given canvas element. Events are forwarded to the global JS function
    /// `__rvst_dispatch_event(eventType, payloadJson)`.
    pub fn setup_input(&self, canvas: &web_sys::HtmlCanvasElement) -> Result<(), JsValue> {
        events::setup_event_listeners(canvas)
    }
}

// ---------------------------------------------------------------------------
// Command registry — wasm-bindgen exports
// ---------------------------------------------------------------------------
//
// rvst-quickjs depends on rquickjs (native QuickJS bindings) which does NOT
// compile to wasm32-unknown-unknown.  The command registry (HashMap, register,
// invoke, capabilities) lives in rvst_quickjs::commands today.
//
// TODO: Extract a thin `rvst-commands` crate that owns the registry, then have
// both rvst-quickjs and rvst-web depend on it.  Until then we duplicate the
// minimal registry inline so WASM consumers get the same invoke API shape.

mod commands {
    use std::collections::{HashMap, HashSet};
    use std::sync::{LazyLock, Mutex};

    type Handler = Box<dyn Fn(&str) -> String + Send + Sync>;

    static REGISTRY: LazyLock<Mutex<HashMap<String, (Handler, Option<String>)>>> =
        LazyLock::new(|| Mutex::new(HashMap::new()));

    static GRANTED_CAPABILITIES: LazyLock<Mutex<HashSet<String>>> =
        LazyLock::new(|| Mutex::new(HashSet::new()));

    pub fn register(name: &str, handler: Handler, capability: Option<String>) {
        REGISTRY
            .lock()
            .unwrap()
            .insert(name.to_string(), (handler, capability));
    }

    pub fn grant_capability(cap: &str) {
        GRANTED_CAPABILITIES
            .lock()
            .unwrap()
            .insert(cap.to_string());
    }

    fn check_capability(name: &str, required: &Option<String>) -> Result<(), String> {
        if let Some(cap) = required {
            if !GRANTED_CAPABILITIES.lock().unwrap().contains(cap.as_str()) {
                return Err(format!(
                    "command '{}' requires capability '{}' which is not granted",
                    name, cap
                ));
            }
        }
        Ok(())
    }

    pub fn invoke(name: &str, payload_json: &str) -> Result<String, String> {
        let registry = REGISTRY.lock().unwrap();
        match registry.get(name) {
            Some((handler, required_cap)) => {
                check_capability(name, required_cap)?;
                Ok(handler(payload_json))
            }
            None => Err(format!("no native handler registered for '{}'", name)),
        }
    }
}

/// Invoke a registered command synchronously.
/// Returns JSON result string or throws a JS error.
#[wasm_bindgen]
pub fn invoke_command(name: &str, payload_json: &str) -> Result<String, JsValue> {
    commands::invoke(name, payload_json).map_err(|e| JsValue::from_str(&e))
}

/// Invoke a command asynchronously — returns a `Promise<string>`.
///
/// WASM is single-threaded so "async" here just means we yield back to the JS
/// event loop between the call and the result.  Heavy work should use Web
/// Workers on the JS side.
#[wasm_bindgen]
pub async fn invoke_command_async(name: &str, payload_json: &str) -> Result<JsValue, JsValue> {
    let name = name.to_string();
    let payload = payload_json.to_string();

    let result =
        commands::invoke(&name, &payload).map_err(|e| JsValue::from_str(&e))?;

    Ok(JsValue::from_str(&result))
}

/// Grant a capability for the WASM runtime.
#[wasm_bindgen]
pub fn grant_capability(cap: &str) {
    commands::grant_capability(cap);
}

/// Register built-in commands (called during WASM init).
///
/// TODO: Once `rvst-commands` is extracted, this will call
/// `rvst_commands::register_collected()` to pull in inventory-submitted
/// commands.  For now it is a no-op placeholder that the JS bootstrap should
/// call before invoking any commands.
#[wasm_bindgen]
pub fn init_commands() {
    // Placeholder — no inventory collection available in the WASM build yet.
}

fn create_target(device: &wgpu::Device, w: u32, h: u32) -> (wgpu::Texture, wgpu::TextureView) {
    let texture = device.create_texture(&wgpu::TextureDescriptor {
        label: Some("vello-target"),
        size: wgpu::Extent3d {
            width: w,
            height: h,
            depth_or_array_layers: 1,
        },
        mip_level_count: 1,
        sample_count: 1,
        dimension: wgpu::TextureDimension::D2,
        format: wgpu::TextureFormat::Rgba8Unorm,
        usage: wgpu::TextureUsages::STORAGE_BINDING
            | wgpu::TextureUsages::TEXTURE_BINDING
            | wgpu::TextureUsages::RENDER_ATTACHMENT,
        view_formats: &[],
    });
    let view = texture.create_view(&wgpu::TextureViewDescriptor::default());
    (texture, view)
}
