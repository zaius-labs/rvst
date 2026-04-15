const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('benchAPI', {
  writeFile: (path, data) => {
    ipcRenderer.send('bench-write-file', path, data);
  }
});
