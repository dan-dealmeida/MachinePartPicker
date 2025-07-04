const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
// const componenteService = require('./services/componenteService');
// const orcamentoService = require('./services/orcamentoService');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      //preload: path.join(__dirname, 'ui/preload.js'),
      contextIsolation: false,
      nodeIntegration: true,
    }
  });
  mainWindow.loadFile('src/ui/index.html');
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});