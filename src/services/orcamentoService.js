// src/services/orcamentoService.js
const db = require('../../database/databaseManager');

const orcamentoService = {
  save: (orcamentoData) => {
    return new Promise((resolve, reject) => {
      if (!orcamentoData || !orcamentoData.nomeCliente || !orcamentoData.itens) {
        return reject(new Error("Dados do orçamento são inválidos."));
      }
      const sql = `
        INSERT INTO orcamentos (nome_cliente, data_criacao, valor_total, itens)
        VALUES (?, ?, ?, ?)
      `;
      const params = [
        orcamentoData.nomeCliente,
        new Date().toISOString(),
        orcamentoData.valorTotal,
        JSON.stringify(orcamentoData.itens)
      ];
      db.run(sql, params, function (err) {
        if (err) {
          console.error("Erro ao salvar orçamento:", err.message);
          reject(new Error("Falha ao salvar orçamento no banco de dados."));
        } else {
          resolve({ id: this.lastID });
        }
      });
    });
  },
  // Funções getAll e getById podem ser convertidas da mesma forma se necessário.
};

module.exports = orcamentoService;