| Metric | RVST | ELECTRON | TAURI |
|--------|--------|--------|--------|
| Cold startup | **808.3 ms** | 2327.4 ms | 1309.6 ms |
| Warm startup | 811.0 ms | 811.0 ms | **808.9 ms** |
| Memory (idle) | 289.6 MB | 471.8 MB | **75.9 MB** |
| Memory (peak) | 5340.0 MB | 472.2 MB | **76.2 MB** |
| Binary size | 15.9 MB | 391.4 MB | **7.7 MB** |

| Render Metric | RVST | ELECTRON | TAURI |
|--------|--------|--------|--------|
| first_paint_ms | 11.53 | **4.5** | 5 |
| fs_read_1mb_ms | **0.48** | N/A | N/A |
| fs_write_1mb_ms | **0.36** | 0.6 | N/A |
| table_generate | 0.95 | **0.4** | 1.0 |
| table_sort | 9.12 | 2.4 | **2** |