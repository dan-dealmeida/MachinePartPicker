// database/setup.js
const db = require('./databaseManager');

if (!db) {
  console.error("Instância do banco de dados não disponível. O setup não pode continuar.");
  process.exit(1);
}

console.log('Iniciando a configuração do banco de dados com a biblioteca sqlite3...');

const setupStatements = `
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

// db.serialize garante que os comandos dentro dele rodem em sequência.
db.serialize(() => {
  // Executa as criações de tabela.
  db.exec(setupStatements, (err) => {
    if (err) {
      console.error('Erro ao criar as tabelas:', err.message);
    } else {
      console.log('Tabelas criadas com sucesso ou já existentes.');

      // Após criar as tabelas, insere os dados de exemplo.
      const insertStatements = `
        INSERT INTO categorias (nome) SELECT 'Processadores' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'Processadores');
        INSERT INTO categorias (nome) SELECT 'Memórias' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'Memórias');
        INSERT INTO categorias (nome) SELECT 'Armazenamento' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'Armazenamento');
      `;

      db.exec(insertStatements, (err) => {
        if (err) {
          console.error('Erro ao inserir categorias de exemplo:', err.message);
        } else {
          console.log('Categorias de exemplo inseridas com sucesso.');
        }

        // Fecha a conexão com o banco de dados após tudo terminar.
        db.close((err) => {
          if (err) {
            console.error('Erro ao fechar a conexão com o banco de dados:', err.message);
          } else {
            console.log('Conexão com o banco de dados fechada.');
          }
        });
      });
    }
  });
});