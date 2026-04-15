const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

ipcMain.on('bench-write-file', (event, filePath, data) => {
  fs.writeFileSync(filePath, data, 'utf-8');
});

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1024, height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });
  win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  win.on('closed', () => app.quit());
});

app.on('window-all-closed', () => app.quit());
