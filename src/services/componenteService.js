// src/services/componenteService.js
const db = require('../../database/databaseManager');

const componenteService = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT c.*, cat.nome as categoria_nome 
        FROM componentes c
        LEFT JOIN categorias cat ON c.categoria_id = cat.id
        ORDER BY cat.nome, c.nome
      `;
      db.all(sql, [], (err, rows) => {
        if (err) {
          console.error("Erro ao buscar componentes:", err.message);
          reject(new Error("Falha ao buscar componentes."));
        } else {
          resolve(rows);
        }
      });
    });
  },

  add: (componente) => {
    return new Promise((resolve, reject) => {
      if (!componente || !componente.nome || typeof componente.preco !== 'number' || !componente.categoria_id) {
        return reject(new Error("Dados do componente são inválidos."));
      }
      const sql = 'INSERT INTO componentes (nome, descricao, preco, categoria_id) VALUES (?, ?, ?, ?)';
      db.run(sql, [componente.nome, componente.descricao, componente.preco, componente.categoria_id], function (err) {
        if (err) {
          console.error("Erro ao adicionar componente:", err.message);
          reject(new Error("Falha ao adicionar componente. O nome já pode existir."));
        } else {
          resolve({ id: this.lastID, ...componente });
        }
      });
    });
  },
};

module.exports = componenteService;