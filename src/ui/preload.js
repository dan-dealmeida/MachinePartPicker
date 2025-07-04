const { contextBridge, ipcRenderer } = require('electron');

// Expõe um objeto 'api' para a janela do renderer (a UI)
// que pode se comunicar com o processo principal (main.js)
contextBridge.exposeInMainWorld('api', {
  // Funções que o frontend pode chamar
  getComponentes: () => ipcRenderer.invoke('componentes:getAll'),
  salvarOrcamento: (orcamento) => ipcRenderer.invoke('orcamentos:save', orcamento),
  // Adicione outras funções aqui conforme necessário
});