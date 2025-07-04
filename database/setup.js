// database/setup.js
const db = require('./databaseManager');

if (!db) {
  console.error("Instância do banco de dados não disponível. O setup não pode continuar.");
  process.exit(1);
}

console.log('Iniciando a configuração do banco de dados (v2)...');

// Adicionando a nova tabela 'categorias' e alterando 'componentes'
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

  -- Inserindo categoria padrão se não existir
  INSERT INTO categorias (nome) SELECT 'Processadores' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'Processadores');
  INSERT INTO categorias (nome) SELECT 'Memórias' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'Memórias');
  INSERT INTO categorias (nome) SELECT 'Armazenamento' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'Armazenamento');

  -- Atualizando componentes existentes para terem uma categoria (exemplo)
  -- NOTA: Em um banco real, seria preciso uma migração mais cuidadosa.
  UPDATE componentes SET categoria_id = (SELECT id FROM categorias WHERE nome = 'Processadores') WHERE nome = 'Processador PowerCore' AND categoria_id IS NULL;
  UPDATE componentes SET categoria_id = (SELECT id FROM categorias WHERE nome = 'Memórias') WHERE nome = 'Memória RAM 16GB' AND categoria_id IS NULL;
  UPDATE componentes SET categoria_id = (SELECT id FROM categorias WHERE nome = 'Armazenamento') WHERE nome = 'SSD UltraFast 1TB' AND categoria_id IS NULL;
`;

try {
  db.exec(setupStatements);
  console.log('Tabelas (v2) criadas e dados de exemplo inseridos/atualizados com sucesso.');
} catch (error) {
  console.error('Erro ao criar/atualizar as tabelas:', error);
} finally {
  db.close();
}