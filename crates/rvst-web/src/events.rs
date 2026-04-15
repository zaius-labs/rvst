use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{HtmlCanvasElement, KeyboardEvent, MouseEvent, WheelEvent};

/// Set up all input event listeners on the canvas.
/// Calls back into JS via `__rvst_dispatch_event` when events hit RVST nodes.
pub fn setup_event_listeners(canvas: &HtmlCanvasElement) -> Result<(), JsValue> {
    // Mouse click
    let click_closure = Closure::wrap(Box::new(move |event: MouseEvent| {
        let x = event.offset_x() as f32;
        let y = event.offset_y() as f32;
        let payload = format!("{{\"x\":{},\"y\":{},\"button\":{}}}", x, y, event.button());
        dispatch_to_js("click", &payload);
    }) as Box<dyn FnMut(_)>);
    canvas.add_event_listener_with_callback("click", click_closure.as_ref().unchecked_ref())?;
    click_closure.forget(); // Leak — lives for app lifetime

    // Mouse move
    let mousemove_closure = Closure::wrap(Box::new(move |event: MouseEvent| {
        let x = event.offset_x() as f32;
        let y = event.offset_y() as f32;
        let payload = format!("{{\"x\":{},\"y\":{}}}", x, y);
        dispatch_to_js("mousemove", &payload);
    }) as Box<dyn FnMut(_)>);
    canvas
        .add_event_listener_with_callback("mousemove", mousemove_closure.as_ref().unchecked_ref())?;
    mousemove_closure.forget();

    // Keyboard — canvas needs tabindex to receive keyboard events
    let keydown_closure = Closure::wrap(Box::new(move |event: KeyboardEvent| {
        let payload = format!(
            "{{\"key\":\"{}\",\"code\":\"{}\",\"shift\":{},\"ctrl\":{},\"alt\":{},\"meta\":{}}}",
            event.key(),
            event.code(),
            event.shift_key(),
            event.ctrl_key(),
            event.alt_key(),
            event.meta_key()
        );
        dispatch_to_js("keydown", &payload);
    }) as Box<dyn FnMut(_)>);
    canvas
        .add_event_listener_with_callback("keydown", keydown_closure.as_ref().unchecked_ref())?;
    keydown_closure.forget();

    let keyup_closure = Closure::wrap(Box::new(move |event: KeyboardEvent| {
        let payload = format!(
            "{{\"key\":\"{}\",\"code\":\"{}\"}}",
            event.key(),
            event.code()
        );
        dispatch_to_js("keyup", &payload);
    }) as Box<dyn FnMut(_)>);
    canvas.add_event_listener_with_callback("keyup", keyup_closure.as_ref().unchecked_ref())?;
    keyup_closure.forget();

    // Scroll/wheel — passive: false so we can preventDefault
    let wheel_closure = Closure::wrap(Box::new(move |event: WheelEvent| {
        event.prevent_default();
        let payload = format!(
            "{{\"deltaX\":{},\"deltaY\":{}}}",
            event.delta_x(),
            event.delta_y()
        );
        dispatch_to_js("wheel", &payload);
    }) as Box<dyn FnMut(_)>);
    // Use the bool overload (useCapture=true) — wheel needs non-passive to preventDefault
    canvas.add_event_listener_with_callback_and_bool(
        "wheel",
        wheel_closure.as_ref().unchecked_ref(),
        true,
    )?;
    wheel_closure.forget();

    Ok(())
}

/// Forward an event to the global JS dispatcher function `__rvst_dispatch_event`.
fn dispatch_to_js(event_type: &str, payload: &str) {
    let global = js_sys::global();
    let func =
        js_sys::Reflect::get(&global, &JsValue::from_str("__rvst_dispatch_event")).ok();
    if let Some(func) = func {
        if let Ok(f) = func.dyn_into::<js_sys::Function>() {
            let _ = f.call2(
                &JsValue::NULL,
                &JsValue::from_str(event_type),
                &JsValue::from_str(payload),
            );
        }
    }
}
