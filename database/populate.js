// database/populate.js
const db = require('./databaseManager');

if (!db) {
  console.error("Instância do banco de dados não disponível. O script de população não pode continuar.");
  process.exit(1);
}

const catalogo = [
    {
        categoria: 'Processadores',
        componentes: [
            { nome: 'AMD Ryzen 7 8700X', descricao: '8 Núcleos, 16 Threads, Boost Clock 5.1GHz', preco: 2100.00 },
            { nome: 'Intel Core i5-14600K', descricao: '14 Núcleos (6P+8E), 20 Threads, Boost Clock 5.3GHz', preco: 1850.50 },
            { nome: 'Intel Core i7-14700K', descricao: '20 Núcleos (8P+12E), 28 Threads, Boost Clock 5.6GHz', preco: 2800.00 },
        ]
    },
    {
        categoria: 'Placas de Vídeo',
        componentes: [
            { nome: 'NVIDIA GeForce RTX 4060 Ti 8GB', descricao: 'DLSS 3, Ray Tracing, Arquitetura Ada Lovelace', preco: 2550.00 },
            { nome: 'NVIDIA GeForce RTX 4070 Super 12GB', descricao: 'Performance superior para 1440p gaming', preco: 4200.00 },
            { nome: 'AMD Radeon RX 7800 XT 16GB', descricao: 'Arquitetura RDNA 3, FSR 3', preco: 3500.00 },
        ]
    },
    // ... (resto dos dados do catálogo) ...
    {
        categoria: 'Gabinetes',
        componentes: [
            { nome: 'Lian Li Lancool 216', descricao: 'Mid-Tower, Excelente fluxo de ar, Preto', preco: 650.00 },
            { nome: 'NZXT H5 Flow', descricao: 'Mid-Tower, Design limpo, Branco', preco: 580.00 },
            { nome: 'Cooler Master MasterBox Q300L', descricao: 'Micro-ATX, Compacto e versátil', preco: 350.00 },
        ]
    },
];

// Funções auxiliares que convertem as chamadas de callback para Promises
function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// Função principal assíncrona que controla todo o fluxo
async function populateDatabase() {
    console.log('Iniciando script para popular o banco de dados...');
    
    // Inicia uma transação para performance
    await dbRun('BEGIN TRANSACTION');

    try {
        for (const item of catalogo) {
            const categoriaNome = item.categoria;
            
            await dbRun('INSERT OR IGNORE INTO categorias (nome) VALUES (?)', [categoriaNome]);
            console.log(`Categoria "${categoriaNome}" processada.`);
            
            const categoria = await dbGet('SELECT id FROM categorias WHERE nome = ?', [categoriaNome]);
            
            if (categoria) {
                for (const comp of item.componentes) {
                    await dbRun(
                        'INSERT OR IGNORE INTO componentes (nome, descricao, preco, categoria_id) VALUES (?, ?, ?, ?)',
                        [comp.nome, comp.descricao, comp.preco, categoria.id]
                    );
                }
                console.log(`  -> ${item.componentes.length} componentes processados para "${categoriaNome}".`);
            }
        }
        // Se tudo deu certo, commita a transação
        await dbRun('COMMIT');
        console.log('\nBanco de dados populado com sucesso!');
    } catch (err) {
        // Se algo deu errado, faz rollback
        await dbRun('ROLLBACK');
        console.error('Ocorreu um erro ao popular o banco de dados:', err.message);
    } finally {
        // Fecha a conexão, não importa se deu certo ou errado.
        db.close((err) => {
            if (err) console.error('Erro ao fechar o banco:', err.message);
            else console.log('População finalizada. Conexão com o banco de dados fechada.');
        });
    }
}

// Executa a função principal
populateDatabase();