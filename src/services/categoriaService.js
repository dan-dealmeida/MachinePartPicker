// src/services/categoriaService.js
const db = require('../../database/databaseManager');

const categoriaService = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM categorias ORDER BY nome', [], (err, rows) => {
        if (err) {
          console.error("Erro ao buscar categorias:", err.message);
          reject(new Error("Falha ao buscar categorias."));
        } else {
          resolve(rows);
        }
      });
    });
  },

  add: (categoria) => {
    return new Promise((resolve, reject) => {
      if (!categoria || !categoria.nome) {
        return reject(new Error("O nome da categoria é obrigatório."));
      }
      const stmt = db.prepare('INSERT INTO categorias (nome) VALUES (?)');
      stmt.run(categoria.nome, function (err) {
        if (err) {
          console.error("Erro ao adicionar categoria:", err.message);
          reject(new Error("Falha ao adicionar categoria. O nome já pode existir."));
        } else {
          resolve({ id: this.lastID, ...categoria });
        }
        stmt.finalize();
      });
    });
  }
};

module.exports = categoriaService;