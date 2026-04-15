use rquickjs::Context;
use rvst_core::Op;

/// Drain all pending Promise microtasks from the QuickJS runtime.
fn drain_microtasks(ctx: &rquickjs::Ctx<'_>) {
    // Ctx::execute_pending_job() returns true if a job was executed, false if queue empty.
    while ctx.execute_pending_job() {}
}

/// Public version of drain_microtasks for use by dispatch methods on RvstRuntime.
pub fn drain_microtasks_inner(ctx: &rquickjs::Ctx<'_>) {
    drain_microtasks(ctx);
}

/// Strip ES module `export { ... }` from a bundle so it can run as a plain script.
/// Finds the rvst_mount export and assigns it to globalThis.
fn strip_esm_exports(code: &str) -> String {
    if let Some(export_start) = code.rfind("export {") {
        let tail = &code[export_start..];
        if let Some(close_offset) = tail.find("};") {
            let export_block = &tail[..close_offset + 2];
            if export_block.contains("rvst_mount") {
                // Extract content between { and } to get the export clauses
                let inner = export_block
                    .trim_start_matches("export")
                    .trim()
                    .trim_start_matches('{')
                    .trim_end_matches(';')
                    .trim_end_matches('}')
                    .trim();
                let local_name = inner
                    .split(',')
                    .find_map(|clause| {
                        let clause = clause.trim();
                        if clause.contains("as rvst_mount") {
                            clause.split_whitespace().next().map(|s| s.to_string())
                        } else {
                            None
                        }
                    })
                    .unwrap_or_else(|| "rvst_mount".to_string());

                let mut result = code[..export_start].to_string();
                result.push_str(&format!("globalThis.rvst_mount = {};\n", local_name));
                result.push_str(&tail[close_offset + 2..]);
                return result;
            }
        }
    }
    code.to_string()
}

/// Execute initial mount: load stubs, execute bundle, call rvst_mount.
/// Returns the DOM ops produced during mount.
pub fn mount(ctx: &Context, bundle: &str) -> anyhow::Result<Vec<Op>> {
    ctx.with(|ctx| {
        crate::clear_op_stream();

        // 1. Load DOM stubs
        ctx.eval::<(), _>(crate::stubs::dom_stubs_js())
            .map_err(|e| {
                let exc = ctx.catch();
                let msg = exc.as_exception()
                    .map(|e| format!("{}: {}", e.message().unwrap_or_default(), e.stack().unwrap_or_default()))
                    .unwrap_or_else(|| format!("{e}"));
                anyhow::anyhow!("stubs eval failed: {msg}")
            })?;

        // 2. Strip ESM exports and execute as script
        let runnable = strip_esm_exports(bundle);
        if let Err(e) = ctx.eval::<(), _>(runnable.as_str()) {
            let exc = ctx.catch();
            let msg = exc.as_exception()
                .map(|e| format!("{}: {}", e.message().unwrap_or_default(), e.stack().unwrap_or_default()))
                .unwrap_or_else(|| format!("{e}"));
            return Err(anyhow::anyhow!("bundle exec failed: {msg}"));
        }

        // 3. Call rvst_mount(document.body) + flush
        ctx.eval::<(), _>(
            "if (typeof rvst_mount === 'function') { rvst_mount(document.body); } __host.op_flush();"
        ).map_err(|e| {
            let exc = ctx.catch();
            let msg = exc.as_exception()
                .map(|e| format!("{}: {}", e.message().unwrap_or_default(), e.stack().unwrap_or_default()))
                .unwrap_or_else(|| format!("{e}"));
            anyhow::anyhow!("mount failed: {msg}")
        })?;

        // 4. Drain all microtasks from Svelte's reactive setup
        drain_microtasks(&ctx);

        // 5. Fire any rAF callbacks registered during mount
        fire_pending_raf(&ctx)?;

        // 6. Drain microtasks again (rAF callbacks may have queued more)
        drain_microtasks(&ctx);

        // 7. Second rAF cycle — some libraries schedule rAF from within rAF
        if crate::TIMER_WHEEL.lock().unwrap().raf_count() > 0 {
            fire_pending_raf(&ctx)?;
            drain_microtasks(&ctx);
        }

        Ok(crate::get_ops())
    })
}

/// Per-frame tick: fire timers -> drain async results -> fire rAF -> drain microtasks -> collect ops.
pub fn tick(ctx: &Context) -> Vec<Op> {
    ctx.with(|ctx| {
        crate::clear_op_stream();

        // 1. Fire due timers
        let timer_ids = crate::check_and_drain_timers();
        for handler_id in timer_ids {
            let script = format!(
                r#"(function() {{
                    let __h = __rvst_handlers.get({handler_id});
                    if (__h) {{
                        __h();
                    }}
                }})();"#
            );
            let _ = ctx.eval::<(), _>(script.as_str());
        }

        // 2. Drain microtasks after timer callbacks
        drain_microtasks(&ctx);

        // 3. Resolve any completed async commands
        resolve_pending_async(&ctx);

        // 4. Drain microtasks from async resolutions
        drain_microtasks(&ctx);

        // 5. Deliver push events from Rust to JS subscribers
        if crate::subscriptions::has_pending_events() {
            let _ = ctx.eval::<(), _>("__rvst_deliver_events()");
            drain_microtasks(&ctx);
        }

        // 6. Fire pending rAF callbacks
        fire_pending_raf(&ctx).ok();

        // 7. Drain microtasks again (rAF callbacks may queue work)
        drain_microtasks(&ctx);

        crate::get_ops()
    })
}

/// Drain completed async command results and resolve/reject their JS Promises.
fn resolve_pending_async(ctx: &rquickjs::Ctx<'_>) {
    let resolutions = crate::commands::drain_resolutions();
    if resolutions.is_empty() {
        return;
    }

    for (id, result) in resolutions {
        let (ok, value) = match result {
            Ok(json) => (true, json),
            Err(e) => (false, e.replace('\\', "\\\\").replace('"', "\\\"")),
        };
        let script = if ok {
            format!(
                r#"(function() {{
                    const entry = __rvst_async_resolvers.get({id});
                    if (entry) {{
                        __rvst_async_resolvers.delete({id});
                        try {{ entry.resolve({value}); }} catch(e) {{ __host.op_log("async resolve error: " + e); }}
                    }}
                }})();"#
            )
        } else {
            format!(
                r#"(function() {{
                    const entry = __rvst_async_resolvers.get({id});
                    if (entry) {{
                        __rvst_async_resolvers.delete({id});
                        entry.reject(new Error("{value}"));
                    }}
                }})();"#
            )
        };
        let _ = ctx.eval::<(), _>(script.as_str());
    }
}

/// Fire all pending rAF callbacks by evaluating JS that looks them up.
pub fn fire_pending_raf_inner(ctx: &rquickjs::Ctx<'_>) -> anyhow::Result<()> {
    fire_pending_raf(ctx)
}

fn fire_pending_raf(ctx: &rquickjs::Ctx<'_>) -> anyhow::Result<()> {
    let (raf_ids, timestamp) = crate::TIMER_WHEEL.lock().unwrap().drain_raf();
    for id in raf_ids {
        let script = format!(
            r#"(function() {{
                const fn = __rvst_raf_pending.get({id});
                if (fn) {{
                    __rvst_raf_pending.delete({id});
                    fn({timestamp});
                }}
            }})();"#
        );
        if let Err(e) = ctx.eval::<(), _>(script.as_str()) {
            let exc = ctx.catch();
            let msg = exc.as_exception()
                .map(|e| format!("{}: {}", e.message().unwrap_or_default(), e.stack().unwrap_or_default()))
                .unwrap_or_else(|| format!("{e}"));
            eprintln!("[rAF error] id={id}: {msg}");
        }
    }
    Ok(())
}
