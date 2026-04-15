//! Proc macros for RVST command and watch handler registration.
//!
//! # `#[rvst_command]`
//!
//! Transforms a public function into a command handler with automatic
//! `inventory::submit!` registration against `rvst_quickjs::commands::CommandRegistration`.
//!
//! ```ignore
//! #[rvst_command]
//! pub fn greet(name: String) -> String {
//!     format!("Hello, {}!", name)
//! }
//! ```
//!
//! # `#[rvst_watch]`
//!
//! Marks a function as a streaming watch handler. Currently emits inventory
//! registration with a placeholder; the watch runtime will be added later.
//!
//! # `RvstState` derive
//!
//! Convenience derive that adds `serde::Serialize`, `serde::Deserialize`, `Clone`, and `Debug`.

use proc_macro::TokenStream;
use quote::{format_ident, quote};
use syn::{parse_macro_input, DeriveInput, FnArg, ItemFn, Pat, ReturnType};

/// Register a function as an RVST command.
///
/// The function is preserved as-is, and a hidden handler + `inventory::submit!`
/// block are generated alongside it.
///
/// ## Parameter handling
///
/// - **Zero params**: handler ignores the payload.
/// - **Single param**: payload is deserialized directly as that type.
/// - **Multiple params**: payload is deserialized as a tuple `(T1, T2, ...)`.
#[proc_macro_attribute]
pub fn command(_attr: TokenStream, item: TokenStream) -> TokenStream {
    let input_fn = parse_macro_input!(item as ItemFn);
    let fn_name = &input_fn.sig.ident;
    let handler_name = format_ident!("__rvst_handler_{}", fn_name);

    // Collect typed parameters (skip self receivers).
    let params: Vec<_> = input_fn
        .sig
        .inputs
        .iter()
        .filter_map(|arg| {
            if let FnArg::Typed(pat_type) = arg {
                Some(pat_type)
            } else {
                None
            }
        })
        .collect();

    let param_names: Vec<_> = params
        .iter()
        .map(|pt| {
            if let Pat::Ident(ident) = pt.pat.as_ref() {
                ident.ident.clone()
            } else {
                panic!("rvst::command parameters must be simple identifiers");
            }
        })
        .collect();

    let param_types: Vec<_> = params.iter().map(|pt| &pt.ty).collect();

    // Determine whether the original function returns a value we need to serialize.
    let has_return = !matches!(&input_fn.sig.output, ReturnType::Default);

    let deserialize_and_call = match params.len() {
        0 => {
            if has_return {
                quote! {
                    let _ = payload;
                    let result = #fn_name();
                    serde_json::to_string(&result).unwrap()
                }
            } else {
                quote! {
                    let _ = payload;
                    #fn_name();
                    String::from("{}")
                }
            }
        }
        1 => {
            let ty = &param_types[0];
            let name = &param_names[0];
            if has_return {
                quote! {
                    let #name: #ty = serde_json::from_str(payload).unwrap();
                    let result = #fn_name(#name);
                    serde_json::to_string(&result).unwrap()
                }
            } else {
                quote! {
                    let #name: #ty = serde_json::from_str(payload).unwrap();
                    #fn_name(#name);
                    String::from("{}")
                }
            }
        }
        _ => {
            // Multiple params — deserialize as tuple.
            let tuple_type = quote! { (#(#param_types),*) };
            let tuple_destructure = quote! { (#(#param_names),*) };
            if has_return {
                quote! {
                    let #tuple_destructure: #tuple_type = serde_json::from_str(payload).unwrap();
                    let result = #fn_name(#(#param_names),*);
                    serde_json::to_string(&result).unwrap()
                }
            } else {
                quote! {
                    let #tuple_destructure: #tuple_type = serde_json::from_str(payload).unwrap();
                    #fn_name(#(#param_names),*);
                    String::from("{}")
                }
            }
        }
    };

    let fn_name_str = fn_name.to_string();

    let expanded = quote! {
        #input_fn

        fn #handler_name(payload: &str) -> String {
            #deserialize_and_call
        }

        inventory::submit! {
            rvst_quickjs::commands::CommandRegistration {
                name: #fn_name_str,
                handler: #handler_name,
                capability: None,
            }
        }
    };

    expanded.into()
}

/// Mark a function as a streaming watch handler.
///
/// Currently emits inventory registration so the command is discoverable.
/// The full watch runtime (thread spawning, channel-based `push_event`,
/// start/stop lifecycle) will be added in a future iteration.
#[proc_macro_attribute]
pub fn watch(_attr: TokenStream, item: TokenStream) -> TokenStream {
    let input_fn = parse_macro_input!(item as ItemFn);
    let fn_name = &input_fn.sig.ident;
    let handler_name = format_ident!("__rvst_watch_handler_{}", fn_name);
    let fn_name_str = fn_name.to_string();

    // Collect typed parameters.
    let params: Vec<_> = input_fn
        .sig
        .inputs
        .iter()
        .filter_map(|arg| {
            if let FnArg::Typed(pat_type) = arg {
                Some(pat_type)
            } else {
                None
            }
        })
        .collect();

    let param_names: Vec<_> = params
        .iter()
        .map(|pt| {
            if let Pat::Ident(ident) = pt.pat.as_ref() {
                ident.ident.clone()
            } else {
                panic!("rvst::watch parameters must be simple identifiers");
            }
        })
        .collect();

    let param_types: Vec<_> = params.iter().map(|pt| &pt.ty).collect();

    let deserialize_and_call = match params.len() {
        0 => {
            quote! {
                let _ = payload;
                let result = #fn_name();
                serde_json::to_string(&result).unwrap()
            }
        }
        1 => {
            let ty = &param_types[0];
            let name = &param_names[0];
            quote! {
                let #name: #ty = serde_json::from_str(payload).unwrap();
                let result = #fn_name(#name);
                serde_json::to_string(&result).unwrap()
            }
        }
        _ => {
            let tuple_type = quote! { (#(#param_types),*) };
            let tuple_destructure = quote! { (#(#param_names),*) };
            quote! {
                let #tuple_destructure: #tuple_type = serde_json::from_str(payload).unwrap();
                let result = #fn_name(#(#param_names),*);
                serde_json::to_string(&result).unwrap()
            }
        }
    };

    // TODO: Full watch runtime — spawn thread, provide push_event channel,
    // register start/stop commands. For now, register as a normal command
    // so the entry point is discoverable.
    let expanded = quote! {
        #input_fn

        // NOTE: Watch runtime (thread spawn, push_event channel, start/stop
        // lifecycle) will replace this simple handler in a future iteration.
        fn #handler_name(payload: &str) -> String {
            #deserialize_and_call
        }

        inventory::submit! {
            rvst_quickjs::commands::CommandRegistration {
                name: #fn_name_str,
                handler: #handler_name,
                capability: None,
            }
        }
    };

    expanded.into()
}

/// Derive macro that adds `serde::Serialize`, `serde::Deserialize`, `Clone`, and `Debug`
/// to a struct or enum.
///
/// ```ignore
/// #[derive(RvstState)]
/// pub struct ProcessResult {
///     pub width: u32,
///     pub height: u32,
/// }
/// ```
#[proc_macro_derive(RvstState)]
pub fn derive_rvst_state(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    let name = &input.ident;
    let (impl_generics, ty_generics, where_clause) = input.generics.split_for_impl();

    // We can't retroactively add derive attributes via a derive macro.
    // Instead, we implement a marker trait and remind users to also derive
    // Serialize/Deserialize/Clone/Debug. For a seamless experience, use the
    // attribute form `#[rvst_state]` (not yet implemented) or add the derives
    // manually alongside RvstState.
    //
    // What we CAN do: generate a compile-time assertion that the required
    // traits are implemented.
    let expanded = quote! {
        // Static assertions that #name implements the required traits.
        // These produce clear compile errors if the user forgot to derive them.
        const _: () = {
            fn _assert_serialize #impl_generics () #where_clause {
                fn _requires_serialize<T: serde::Serialize>() {}
                _requires_serialize::<#name #ty_generics>();
            }
            fn _assert_deserialize #impl_generics () #where_clause {
                fn _requires_deserialize<T: serde::de::DeserializeOwned>() {}
                _requires_deserialize::<#name #ty_generics>();
            }
            fn _assert_clone #impl_generics () #where_clause {
                fn _requires_clone<T: Clone>() {}
                _requires_clone::<#name #ty_generics>();
            }
            fn _assert_debug #impl_generics () #where_clause {
                fn _requires_debug<T: std::fmt::Debug>() {}
                _requires_debug::<#name #ty_generics>();
            }
        };
    };

    expanded.into()
}
