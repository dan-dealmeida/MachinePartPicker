const db = require('../../database/databaseManager');

const componenteService = {
  getAll: () => {
    try {
      // Usamos um JOIN para buscar também o nome da categoria
      const stmt = db.prepare(`
        SELECT c.*, cat.nome as categoria_nome 
        FROM componentes c
        LEFT JOIN categorias cat ON c.categoria_id = cat.id
        ORDER BY cat.nome, c.nome
      `);
      return stmt.all();
    } catch (error) {
      console.error("Erro ao buscar componentes:", error);
      return [];
    }
  },

  add: (componente) => {
    if (!componente || !componente.nome || typeof componente.preco !== 'number' || !componente.categoria_id) {
      throw new Error("Dados do componente são inválidos (nome, preço e categoria são obrigatórios).");
    }
    try {
      const stmt = db.prepare('INSERT INTO componentes (nome, descricao, preco, categoria_id) VALUES (@nome, @descricao, @preco, @categoria_id)');
      const info = stmt.run(componente);
      return { id: info.lastInsertRowid, ...componente };
    } catch (error) {
      console.error("Erro ao adicionar componente:", error);
      throw new Error("Falha ao adicionar componente. O nome já pode existir.");
    }
  },

  update: (componente) => {
    if (!componente || !componente.id) {
        throw new Error("ID do componente é obrigatório para atualização.");
    }
    try {
      const stmt = db.prepare('UPDATE componentes SET nome = @nome, descricao = @descricao, preco = @preco WHERE id = @id');
      const info = stmt.run(componente);
      return info.changes > 0;
    } catch (error) {
      console.error("Erro ao atualizar componente:", error);
      throw new Error("Falha ao atualizar componente.");
    }
  },

  delete: (id) => {
    if (!id) {
        throw new Error("ID é obrigatório para exclusão.");
    }
    try {
      const stmt = db.prepare('DELETE FROM componentes WHERE id = ?');
      const info = stmt.run(id);
      return info.changes > 0;
    } catch (error) {
      console.error("Erro ao deletar componente:", error);
      throw new Error("Falha ao deletar componente.");
    }
  }
};

module.exports = componenteService;