const db = require('../../database/databaseManager');

const orcamentoService = {
  save: (orcamento) => {
    if (!orcamento || !orcamento.nomeCliente || !orcamento.itens) {
      throw new Error("Dados do orçamento são inválidos.");
    }
    try {
      const stmt = db.prepare(`
        INSERT INTO orcamentos (nome_cliente, data_criacao, valor_total, itens)
        VALUES (@nome_cliente, @data_criacao, @valor_total, @itens)
      `);
      
      const info = stmt.run({
        nome_cliente: orcamento.nomeCliente,
        data_criacao: new Date().toISOString(),
        valor_total: orcamento.getTotal(),
        itens: JSON.stringify(orcamento.itens) // Serializa a lista de itens
      });

      return { id: info.lastInsertRowid };
    } catch (error) {
      console.error("Erro ao salvar orçamento:", error);
      throw new Error("Falha ao salvar orçamento no banco de dados.");
    }
  },

  getAll: () => {
    try {
      const stmt = db.prepare('SELECT * FROM orcamentos ORDER BY data_criacao DESC');
      // Deserializa os itens de JSON para objeto
      const orcamentos = stmt.all().map(o => ({ ...o, itens: JSON.parse(o.itens) }));
      return orcamentos;
    } catch (error) {
      console.error("Erro ao buscar orçamentos:", error);
      return [];
    }
  },

  getById: (id) => {
    try {
      const stmt = db.prepare('SELECT * FROM orcamentos WHERE id = ?');
      const orcamento = stmt.get(id);
      if (orcamento) {
          orcamento.itens = JSON.parse(orcamento.itens);
      }
      return orcamento;
    } catch (error) {
      console.error(`Erro ao buscar orçamento com ID ${id}:`, error);
      return null;
    }
  }
};

module.exports = orcamentoService;