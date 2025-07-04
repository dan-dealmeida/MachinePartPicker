// src/services/categoriaService.js
const db = require('../../database/databaseManager');

const categoriaService = {
  getAll: () => {
    try {
      const stmt = db.prepare('SELECT * FROM categorias ORDER BY nome');
      return stmt.all();
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      return [];
    }
  },

  add: (categoria) => {
    if (!categoria || !categoria.nome) {
      throw new Error("O nome da categoria é obrigatório.");
    }
    try {
      const stmt = db.prepare('INSERT INTO categorias (nome) VALUES (@nome)');
      const info = stmt.run(categoria);
      return { id: info.lastInsertRowid, ...categoria };
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      throw new Error("Falha ao adicionar categoria. O nome já pode existir.");
    }
  }
  // Funções de update e delete podem ser adicionadas aqui no futuro.
};

module.exports = categoriaService;