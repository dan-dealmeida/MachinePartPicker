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
    {
        categoria: 'Placas-mãe',
        componentes: [
            { nome: 'ASUS TUF GAMING B650M-PLUS', descricao: 'Socket AM5, DDR5, Wi-Fi 6', preco: 1300.00 },
            { nome: 'Gigabyte Z790 AORUS ELITE AX', descricao: 'Socket LGA1700, DDR5, Wi-Fi 6E', preco: 1950.00 },
        ]
    },
    {
        categoria: 'Memórias',
        componentes: [
            { nome: 'Corsair Vengeance DDR5 32GB (2x16GB)', descricao: '6000MHz, CL30, Preto', preco: 850.00 },
            { nome: 'Kingston Fury Beast DDR5 16GB (1x16GB)', descricao: '5600MHz, CL36', preco: 480.00 },
        ]
    },
    {
        categoria: 'Armazenamento',
        componentes: [
            { nome: 'Samsung 990 PRO NVMe M.2 1TB', descricao: 'Leitura até 7450 MB/s, Escrita até 6900 MB/s', preco: 650.00 },
            { nome: 'WD Black SN770 NVMe M.2 2TB', descricao: 'Leitura até 5150 MB/s', preco: 980.00 },
            { nome: 'Crucial P3 Plus NVMe M.2 4TB', descricao: 'Ótimo custo-benefício para grande capacidade', preco: 1500.00 },
        ]
    },
    {
        categoria: 'Fontes de Alimentação',
        componentes: [
            { nome: 'Corsair RM850e 850W', descricao: '80 Plus Gold, Modular, ATX 3.0', preco: 880.00 },
            { nome: 'Cooler Master MWE 750W Bronze V2', descricao: '80 Plus Bronze', preco: 520.00 },
        ]
    },
    {
        categoria: 'Gabinetes',
        componentes: [
            { nome: 'Lian Li Lancool 216', descricao: 'Mid-Tower, Excelente fluxo de ar, Preto', preco: 650.00 },
            { nome: 'NZXT H5 Flow', descricao: 'Mid-Tower, Design limpo, Branco', preco: 580.00 },
            { nome: 'Cooler Master MasterBox Q300L', descricao: 'Micro-ATX, Compacto e versátil', preco: 350.00 },
        ]
    },
];

// Funções auxiliares que "promisificam" as chamadas ao banco de dados
function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this);
            }
        });
    });
}

function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

// Função principal assíncrona para controlar o fluxo
async function populateDatabase() {
    console.log('Iniciando script para popular o banco de dados...');
    
    // db.serialize garante que o bloco inteiro execute em ordem
    db.serialize(async () => {
        try {
            for (const item of catalogo) {
                const categoriaNome = item.categoria;
                
                // Insere a categoria (ou ignora se já existir)
                await dbRun('INSERT OR IGNORE INTO categorias (nome) VALUES (?)', [categoriaNome]);
                console.log(`Categoria "${categoriaNome}" processada.`);
                
                // Pega o ID da categoria
                const categoria = await dbGet('SELECT id FROM categorias WHERE nome = ?', [categoriaNome]);
                
                if (categoria) {
                    for (const comp of item.componentes) {
                        // Insere o componente
                        await dbRun(
                            'INSERT OR IGNORE INTO componentes (nome, descricao, preco, categoria_id) VALUES (?, ?, ?, ?)',
                            [comp.nome, comp.descricao, comp.preco, categoria.id]
                        );
                    }
                    console.log(`  -> ${item.componentes.length} componentes processados para "${categoriaNome}".`);
                }
            }
            console.log('\nBanco de dados populado com sucesso!');
        } catch (err) {
            console.error('Ocorreu um erro ao popular o banco de dados:', err.message);
        } finally {
            db.close((err) => {
                if (err) console.error('Erro ao fechar o banco:', err.message);
            });
        }
    });
}

populateDatabase();