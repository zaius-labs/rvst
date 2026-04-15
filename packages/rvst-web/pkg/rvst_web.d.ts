/* tslint:disable */
/* eslint-disable */

/**
 * The RVST rendering engine for the browser.
 * Holds the tree, CSS engine, text renderer, and GPU renderer.
 */
export class RvstEngine {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Create an element node and return its ID.
     */
    create_node(tag: string): number;
    /**
     * Create a text node and return its ID.
     */
    create_text_node(text: string): number;
    /**
     * Initialize the GPU renderer with a canvas element. Must be called before render().
     * This is async because wgpu adapter/device creation requires promises in WASM.
     */
    init_gpu(canvas: HTMLCanvasElement): Promise<void>;
    /**
     * Insert a child into a parent, optionally before an anchor.
     */
    insert(parent_id: number, child_id: number, anchor_id?: number | null): void;
    /**
     * Load a CSS stylesheet.
     */
    load_css(css_text: string): void;
    /**
     * Load a font from raw TTF/OTF bytes.
     */
    load_font(data: Uint8Array): void;
    /**
     * Create a new engine instance (GPU not yet initialized).
     */
    constructor(width: number, height: number);
    /**
     * Get the total node count.
     */
    node_count(): number;
    /**
     * Remove a child from its parent.
     */
    remove(child_id: number): void;
    /**
     * Apply CSS cascade, compute layout, build scene, and render to the canvas.
     */
    render(): void;
    /**
     * Resize the viewport.
     */
    resize(width: number, height: number): void;
    /**
     * Get the root node ID.
     */
    root_id(): number;
    /**
     * Set an attribute on a node.
     */
    set_attribute(id: number, key: string, value: string): void;
    /**
     * Set a style property on a node.
     */
    set_style(id: number, key: string, value: string): void;
    /**
     * Set text content on a text node.
     */
    set_text(id: number, text: string): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_rvstengine_free: (a: number, b: number) => void;
    readonly rvstengine_create_node: (a: number, b: number, c: number) => number;
    readonly rvstengine_create_text_node: (a: number, b: number, c: number) => number;
    readonly rvstengine_init_gpu: (a: number, b: any) => any;
    readonly rvstengine_insert: (a: number, b: number, c: number, d: number) => void;
    readonly rvstengine_load_css: (a: number, b: number, c: number) => void;
    readonly rvstengine_load_font: (a: number, b: number, c: number) => void;
    readonly rvstengine_new: (a: number, b: number) => number;
    readonly rvstengine_node_count: (a: number) => number;
    readonly rvstengine_remove: (a: number, b: number) => void;
    readonly rvstengine_render: (a: number) => [number, number];
    readonly rvstengine_resize: (a: number, b: number, c: number) => void;
    readonly rvstengine_root_id: (a: number) => number;
    readonly rvstengine_set_attribute: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
    readonly rvstengine_set_text: (a: number, b: number, c: number, d: number) => void;
    readonly rvstengine_set_style: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h198a19b838b56e9e: (a: number, b: number, c: any) => [number, number];
    readonly wasm_bindgen__convert__closures_____invoke__h2e60e120c234346b: (a: number, b: number, c: any, d: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h71ae0784a9c27206: (a: number, b: number, c: any) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_destroy_closure: (a: number, b: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
