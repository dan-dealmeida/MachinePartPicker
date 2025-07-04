// database/databaseManager.js
const path = require('path');
const Database = require('better-sqlite3');

// O caminho para o arquivo do banco de dados será na raiz do projeto
const dbPath = path.resolve(__dirname, '../orcamentos.db');

try {
  // A instância do banco de dados é criada aqui, uma única vez.
  const db = new Database(dbPath);
  console.log('Conexão com o banco de dados SQLite estabelecida com sucesso.');
  
  // Garante que o Node.js não vai fechar a conexão se não houver mais eventos
  db.pragma('journal_mode = WAL');

  // Exportamos a instância única (Padrão Singleton via cache de módulo)
  module.exports = db;

} catch (error) {
  console.error('Erro ao conectar com o banco de dados:', error);
  // Se não conseguir conectar, exporta null para que o resto da app possa lidar com o erro.
  module.exports = null;
}