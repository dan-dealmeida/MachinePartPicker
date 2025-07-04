// src/main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Importamos TODOS os serviços aqui, no processo principal.
const componenteService = require('./services/componenteService');
const categoriaService = require('./services/categoriaService');
const orcamentoService = require('./services/orcamentoService');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 768,
    webPreferences: {
      // Apontamos para o nosso script de "ponte"
      preload: path.join(__dirname, 'ui/preload.js'),
      // Essas configurações são as mais seguras e recomendadas
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  mainWindow.loadFile('src/ui/index.html');
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  // --- CRIANDO OS CANAIS DE COMUNICAÇÃO (IPC) ---
  // O renderer vai "chamar" esses nomes para fazer um pedido.
  // Cada handler precisa retornar o resultado da função do serviço.

  // Canal para Categorias
  ipcMain.handle('categorias:getAll', () => categoriaService.getAll());
  ipcMain.handle('categorias:add', (event, categoria) => categoriaService.add(categoria));

  // Canal para Componentes
  ipcMain.handle('componentes:getAll', () => componenteService.getAll());
  ipcMain.handle('componentes:add', (event, componente) => componenteService.add(componente));

  // Canal para Orçamentos
  ipcMain.handle('orcamentos:save', (event, orcamentoData) => orcamentoService.save(orcamentoData));

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});