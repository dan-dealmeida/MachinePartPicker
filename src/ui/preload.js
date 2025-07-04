// src/ui/preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expomos um objeto 'api' global e seguro para a janela do renderer.
contextBridge.exposeInMainWorld('api', {
  // Mapeamos cada "pedido" para uma função fácil de usar.
  // No renderer, vamos chamar 'window.api.getAllCategorias()'
  getAllCategorias: () => ipcRenderer.invoke('categorias:getAll'),
  addCategoria: (categoria) => ipcRenderer.invoke('categorias:add', categoria),
  
  getAllComponentes: () => ipcRenderer.invoke('componentes:getAll'),
  addComponente: (componente) => ipcRenderer.invoke('componentes:add', componente),
  
  salvarOrcamento: (orcamentoData) => ipcRenderer.invoke('orcamentos:save', orcamentoData),
});