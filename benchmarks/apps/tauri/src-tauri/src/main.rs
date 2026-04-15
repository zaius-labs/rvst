#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn write_bench_results(path: String, data: String) -> Result<(), String> {
    std::fs::write(&path, &data).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![write_bench_results])
        .run(tauri::generate_context!())
        .expect("error running tauri application");
}
