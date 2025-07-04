// database/setup.js
const db = require('./databaseManager');

if (!db) {
  console.error("Instância do banco de dados não disponível. O setup não pode continuar.");
  process.exit(1);
}

console.log('Iniciando a configuração do banco de dados com a biblioteca sqlite3...');

const createTables = `
  CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE
  );
  CREATE TABLE IF NOT EXISTS componentes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT,
    preco REAL NOT NULL,
    categoria_id INTEGER,
    FOREIGN KEY (categoria_id) REFERENCES categorias (id)
  );
  CREATE TABLE IF NOT EXISTS orcamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_cliente TEXT NOT NULL,
    data_criacao TEXT NOT NULL,
    valor_total REAL NOT NULL,
    itens TEXT NOT NULL
  );
`;

const insertInitialData = `
  INSERT OR IGNORE INTO categorias (nome) VALUES ('Processadores'), ('Memórias'), ('Armazenamento');
`;

// db.serialize garante que os comandos rodem em sequência.
db.serialize(() => {
  // O método .exec pode executar múltiplos statements de uma vez.
  db.exec(createTables, (err) => {
    if (err) {
      console.error('Erro ao criar as tabelas:', err.message);
      // Fecha a conexão mesmo se der erro.
      db.close();
      return;
    }
    console.log('Tabelas criadas com sucesso ou já existentes.');

    db.exec(insertInitialData, (err) => {
      if (err) {
        console.error('Erro ao inserir dados iniciais:', err.message);
      } else {
        console.log('Dados iniciais inseridos com sucesso.');
      }
      
      // Este é o ponto final. Fecha a conexão aqui.
      db.close((err) => {
        if (err) {
          console.error('Erro ao fechar a conexão:', err.message);
        } else {
          console.log('Setup finalizado. Conexão com o banco de dados fechada.');
        }
      });
    });
  });
});