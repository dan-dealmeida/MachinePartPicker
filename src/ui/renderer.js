// src/ui/renderer.js
const componenteService = require('../services/componenteService');
const orcamentoService = require('../services/orcamentoService');
const categoriaService = require('../services/categoriaService');
const Orcamento = require('../models/Orcamento');

document.addEventListener('DOMContentLoaded', () => {
    // --- REFERÊNCIAS AOS ELEMENTOS DA UI ---
    // Coluna da Esquerda (Catálogo)
    const catalogoComponentesEl = document.getElementById('catalogo-componentes');
    
    // Coluna Central (Orçamento)
    const nomeClienteInput = document.getElementById('nome-cliente');
    const orcamentoItensContainerEl = document.getElementById('orcamento-itens-container');
    const valorSubtotalEl = document.getElementById('valor-subtotal');
    const valorTotalEl = document.getElementById('valor-total');
    const salvarOrcamentoBtn = document.getElementById('salvar-orcamento-btn');
    
    // Coluna da Direita (Gerenciamento)
    const formAddCategoria = document.getElementById('form-add-categoria');
    const nomeNovaCategoriaInput = document.getElementById('nome-nova-categoria');
    const formAddComponente = document.getElementById('form-add-componente');
    const nomeNovoComponenteInput = document.getElementById('nome-novo-componente');
    const descNovoComponenteInput = document.getElementById('desc-novo-componente');
    const precoNovoComponenteInput = document.getElementById('preco-novo-componente');
    const categoriaNovoComponenteSelect = document.getElementById('categoria-novo-componente');

    // Elementos de Desconto
    const selectTipoDesconto = document.getElementById('select-tipo-desconto');
    const inputValorDesconto = document.getElementById('input-valor-desconto');
    const btnAplicarDesconto = document.getElementById('btn-aplicar-desconto');

    let orcamentoAtual = null;

    // --- FUNÇÕES DE RENDERIZAÇÃO DA UI ---
    const renderizarCatalogo = (componentes) => {
        catalogoComponentesEl.innerHTML = '';
        const componentesAgrupados = componentes.reduce((acc, comp) => {
            const categoria = comp.categoria_nome || 'Sem Categoria';
            if (!acc[categoria]) {
                acc[categoria] = [];
            }
            acc[categoria].push(comp);
            return acc;
        }, {});

        for (const categoriaNome in componentesAgrupados) {
            const details = document.createElement('details');
            details.open = true;
            
            const summary = document.createElement('summary');
            summary.className = 'categoria-grupo';
            summary.textContent = categoriaNome;
            details.appendChild(summary);

            const componentesDaCategoria = componentesAgrupados[categoriaNome];
            componentesDaCategoria.forEach(comp => {
                const div = document.createElement('div');
                div.className = 'componente-item';
                div.textContent = `${comp.nome} - R$ ${comp.preco.toFixed(2)}`;
                div.addEventListener('click', () => adicionarItemAoOrcamento(comp));
                details.appendChild(div);
            });
            catalogoComponentesEl.appendChild(details);
        }
    };

    const renderizarSelectCategorias = (categorias) => {
        categoriaNovoComponenteSelect.innerHTML = '<option value="">-- Selecione --</option>';
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.nome;
            categoriaNovoComponenteSelect.appendChild(option);
        });
    };

    const renderizarOrcamento = () => {
        if (!orcamentoAtual || orcamentoAtual.itens.length === 0) {
            orcamentoItensContainerEl.innerHTML = '<p id="sem-itens-aviso">Nenhum item adicionado.</p>';
            valorSubtotalEl.textContent = 'R$ 0.00';
            valorTotalEl.textContent = 'R$ 0.00';
            return;
        }
        orcamentoItensContainerEl.innerHTML = '';
        orcamentoAtual.itens.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'orcamento-item';
            itemDiv.innerHTML = `<span>${item.nome}</span> <span>R$ ${item.preco.toFixed(2)}</span>`;
            orcamentoItensContainerEl.appendChild(itemDiv);
        });
        valorSubtotalEl.textContent = `R$ ${orcamentoAtual.subTotal.toFixed(2)}`;
        valorTotalEl.textContent = `R$ ${orcamentoAtual.getTotal().toFixed(2)}`;
    };

    // --- FUNÇÕES DE LÓGICA / EVENTOS ---
    const carregarDadosIniciais = () => {
        try {
            const componentes = componenteService.getAll();
            const categorias = categoriaService.getAll();
            renderizarCatalogo(componentes);
            renderizarSelectCategorias(categorias);
        } catch (error) {
            console.error("Erro ao carregar dados iniciais:", error);
            alert("Erro ao carregar dados do catálogo.");
        }
    };

    const handleAddCategoria = (event) => {
        event.preventDefault();
        const nome = nomeNovaCategoriaInput.value.trim();
        if (!nome) {
            alert('O nome da categoria não pode ser vazio.');
            return;
        }
        try {
            categoriaService.add({ nome });
            alert(`Categoria "${nome}" adicionada com sucesso!`);
            nomeNovaCategoriaInput.value = '';
            carregarDadosIniciais();
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    };

    const handleAddComponente = (event) => {
        event.preventDefault();
        const componente = {
            nome: nomeNovoComponenteInput.value.trim(),
            descricao: descNovoComponenteInput.value.trim(),
            preco: parseFloat(precoNovoComponenteInput.value),
            categoria_id: parseInt(categoriaNovoComponenteSelect.value, 10)
        };
        if (!componente.nome || isNaN(componente.preco) || isNaN(componente.categoria_id)) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        try {
            componenteService.add(componente);
            alert(`Componente "${componente.nome}" adicionado com sucesso!`);
            formAddComponente.reset();
            carregarDadosIniciais();
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    };

    const handleAplicarDesconto = () => {
        if (!orcamentoAtual) {
            alert('Crie um orçamento antes de aplicar um desconto.');
            return;
        }
        const tipo = selectTipoDesconto.value;
        const valor = parseFloat(inputValorDesconto.value) || 0;
        orcamentoAtual.setDiscountStrategy(tipo, valor);
    };

    const iniciarNovoOrcamento = () => {
        const nomeCliente = nomeClienteInput.value.trim() || 'Cliente Padrão';
        orcamentoAtual = new Orcamento(nomeCliente);
        orcamentoAtual.on('update', renderizarOrcamento);
        renderizarOrcamento();
        selectTipoDesconto.value = '';
        inputValorDesconto.value = '';
    };

    const adicionarItemAoOrcamento = (componente) => {
        if (!orcamentoAtual) {
            iniciarNovoOrcamento();
        }
        orcamentoAtual.adicionarItem(componente);
    };

    const salvarOrcamento = () => {
        if (!orcamentoAtual || orcamentoAtual.itens.length === 0) {
            alert('Não é possível salvar um orçamento vazio.');
            return;
        }
        
        orcamentoAtual.nomeCliente = nomeClienteInput.value.trim();
        if (!orcamentoAtual.nomeCliente) {
            alert('Por favor, insira o nome do cliente.');
            return;
        }
        try {
            const resultado = orcamentoService.save(orcamentoAtual);
            alert(`Orçamento salvo com sucesso! ID: ${resultado.id}`);
            nomeClienteInput.value = '';
            iniciarNovoOrcamento();
        } catch (error) {
            console.error('Erro ao salvar orçamento:', error);
            alert(`Erro ao salvar orçamento: ${error.message}`);
        }
    };

    // --- INICIALIZAÇÃO E EVENT LISTENERS ---
    btnAplicarDesconto.addEventListener('click', handleAplicarDesconto);
    formAddCategoria.addEventListener('submit', handleAddCategoria);
    formAddComponente.addEventListener('submit', handleAddComponente);
    salvarOrcamentoBtn.addEventListener('click', salvarOrcamento);

    carregarDadosIniciais();
    iniciarNovoOrcamento();
});