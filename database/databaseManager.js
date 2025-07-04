// database/databaseManager.js
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); // .verbose() dá mais informações de debug

const dbPath = path.resolve(__dirname, '../orcamentos.db');

// A conexão agora é assíncrona, então exportamos a instância do banco
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar com o banco de dados SQLite:', err.message);
    } else {
        console.log('Conexão com o banco de dados SQLite estabelecida com sucesso.');
    }
});

// Aumenta o tempo de espera se o banco estiver ocupado (em milissegundos)
db.configure('busyTimeout', 5000);

module.exports = db;