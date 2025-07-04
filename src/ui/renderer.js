// src/ui/renderer.js

// --- LÓGICA PURA DE JAVASCRIPT (SEM NODE.JS) ---

// As classes da Strategy continuam aqui, pois são lógica pura.
class PercentageDiscount {
    constructor(percentage) { this.percentage = parseFloat(percentage) || 0; }
    applyDiscount(originalPrice) {
        if (this.percentage < 0 || this.percentage > 100) return originalPrice;
        return originalPrice * (1 - this.percentage / 100);
    }
}
class FixedValueDiscount {
    constructor(value) { this.value = parseFloat(value) || 0; }
    applyDiscount(originalPrice) { return Math.max(0, originalPrice - this.value); }
}

// A classe Orçamento com o Padrão Observer reimplementado em JS puro
class Orcamento {
    constructor(nomeCliente) {
        this.id = null;
        this.nomeCliente = nomeCliente;
        this.itens = [];
        this.subTotal = 0;
        this.discountStrategy = null;
        this.listeners = {}; // Objeto para guardar os "observadores"
    }

    // Método para registrar um observador (ex: orcamento.on('update', minhaFuncao))
    on(eventName, callback) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(callback);
    }

    // Método para notificar todos os observadores de um evento
    emit(eventName, data) {
        if (this.listeners[eventName]) {
            this.listeners[eventName].forEach(callback => callback(data));
        }
    }

    adicionarItem(item) {
        if (!item || typeof item.preco !== 'number') return console.error("Item inválido.");
        this.itens.push(item);
        this.recalcularSubTotal();
        this.emit('update', this); // Notifica que o orçamento mudou
    }
    
    removerItem(index) {
        if (index > -1 && index < this.itens.length) {
            this.itens.splice(index, 1);
            this.recalcularSubTotal();
            this.emit('update', this);
        }
    }

    recalcularSubTotal() {
        this.subTotal = this.itens.reduce((sum, item) => sum + item.preco, 0);
    }
    
    setDiscountStrategy(strategyType, value) {
        if (strategyType === 'percentage') {
            this.discountStrategy = new PercentageDiscount(value);
        } else if (strategyType === 'fixed') {
            this.discountStrategy = new FixedValueDiscount(value);
        } else {
            this.discountStrategy = null;
        }
        this.emit('update', this); // Notifica que o orçamento mudou
    }

    getTotal() {
        return this.discountStrategy ? this.discountStrategy.applyDiscount(this.subTotal) : this.subTotal;
    }
}
// --- FIM DA LÓGICA PURA ---


document.addEventListener('DOMContentLoaded', () => {
    // --- REFERÊNCIAS AOS ELEMENTOS DA UI ---
    const catalogoComponentesEl = document.getElementById('catalogo-componentes');
    const nomeClienteInput = document.getElementById('nome-cliente');
    const orcamentoItensContainerEl = document.getElementById('orcamento-itens-container');
    const valorSubtotalEl = document.getElementById('valor-subtotal');
    const valorTotalEl = document.getElementById('valor-total');
    const salvarOrcamentoBtn = document.getElementById('salvar-orcamento-btn');
    const formAddCategoria = document.getElementById('form-add-categoria');
    const nomeNovaCategoriaInput = document.getElementById('nome-nova-categoria');
    const formAddComponente = document.getElementById('form-add-componente');
    const nomeNovoComponenteInput = document.getElementById('nome-novo-componente');
    const descNovoComponenteInput = document.getElementById('desc-novo-componente');
    const precoNovoComponenteInput = document.getElementById('preco-novo-componente');
    const categoriaNovoComponenteSelect = document.getElementById('categoria-novo-componente');
    const selectTipoDesconto = document.getElementById('select-tipo-desconto');
    const inputValorDesconto = document.getElementById('input-valor-desconto');
    const btnAplicarDesconto = document.getElementById('btn-aplicar-desconto');
    const statusMessageEl = document.getElementById('status-message');

    let orcamentoAtual = null;
    let statusTimeout;

    // --- FUNÇÃO DE NOTIFICAÇÃO ---
    const showStatusMessage = (message, type = 'success') => {
        clearTimeout(statusTimeout);
        statusMessageEl.textContent = message;
        statusMessageEl.className = `status-message ${type} show`;
        statusTimeout = setTimeout(() => {
            statusMessageEl.classList.remove('show');
        }, 4000);
    };

    // --- FUNÇÕES DE RENDERIZAÇÃO DA UI ---
    const renderizarCatalogo = (componentes) => {
        catalogoComponentesEl.innerHTML = '';
        const componentesAgrupados = componentes.reduce((acc, comp) => {
            const categoria = comp.categoria_nome || 'Sem Categoria';
            if (!acc[categoria]) acc[categoria] = [];
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
            componentesAgrupados[categoriaNome].forEach(comp => {
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
        orcamentoAtual.itens.forEach((item) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'orcamento-item';
            itemDiv.innerHTML = `<span>${item.nome}</span> <span>R$ ${item.preco.toFixed(2)}</span>`;
            orcamentoItensContainerEl.appendChild(itemDiv);
        });
        valorSubtotalEl.textContent = `R$ ${orcamentoAtual.subTotal.toFixed(2)}`;
        valorTotalEl.textContent = `R$ ${orcamentoAtual.getTotal().toFixed(2)}`;
    };

    // --- FUNÇÕES DE LÓGICA (usando a API assíncrona) ---
    const carregarDadosIniciais = async () => {
        try {
            const componentes = await window.api.getAllComponentes();
            const categorias = await window.api.getAllCategorias();
            renderizarCatalogo(componentes);
            renderizarSelectCategorias(categorias);
        } catch (error) {
            console.error("Erro ao carregar dados iniciais:", error);
            showStatusMessage("Erro fatal ao carregar dados do catálogo.", "error");
        }
    };

    const handleAddCategoria = async (event) => {
        event.preventDefault();
        const nome = nomeNovaCategoriaInput.value.trim();
        if (!nome) return showStatusMessage('O nome da categoria não pode ser vazio.', 'error');
        try {
            await window.api.addCategoria({ nome });
            showStatusMessage(`Categoria "${nome}" adicionada com sucesso!`);
            nomeNovaCategoriaInput.value = '';
            nomeNovaCategoriaInput.focus();
            carregarDadosIniciais();
        } catch (error) {
            showStatusMessage(`Erro: ${error.message}`, 'error');
        }
    };

    const handleAddComponente = async (event) => {
        event.preventDefault();
        const componente = {
            nome: nomeNovoComponenteInput.value.trim(),
            descricao: descNovoComponenteInput.value.trim(),
            preco: parseFloat(precoNovoComponenteInput.value),
            categoria_id: parseInt(categoriaNovoComponenteSelect.value, 10)
        };
        if (!componente.nome || isNaN(componente.preco) || isNaN(componente.categoria_id)) {
            return showStatusMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
        }
        try {
            await window.api.addComponente(componente);
            showStatusMessage(`Componente "${componente.nome}" adicionado!`);
            formAddComponente.reset();
            nomeNovoComponenteInput.focus();
            carregarDadosIniciais();
        } catch (error) {
            showStatusMessage(`Erro: ${error.message}`, 'error');
        }
    };

    const salvarOrcamento = async () => {
        if (!orcamentoAtual || orcamentoAtual.itens.length === 0) return showStatusMessage('Não é possível salvar um orçamento vazio.', 'error');
        orcamentoAtual.nomeCliente = nomeClienteInput.value.trim();
        if (!orcamentoAtual.nomeCliente) return showStatusMessage('Por favor, insira o nome do cliente.', 'error');
        try {
            const dadosParaSalvar = {
                nomeCliente: orcamentoAtual.nomeCliente,
                itens: orcamentoAtual.itens,
                valorTotal: orcamentoAtual.getTotal()
            };
            const resultado = await window.api.salvarOrcamento(dadosParaSalvar);
            showStatusMessage(`Orçamento salvo com sucesso! ID: ${resultado.id}`);
            nomeClienteInput.value = '';
            iniciarNovoOrcamento();
        } catch (error) {
            console.error('Erro ao salvar orçamento:', error);
            showStatusMessage(`Erro ao salvar orçamento: ${error.message}`, 'error');
        }
    };
    
    const handleAplicarDesconto = () => {
        if (!orcamentoAtual) return;
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

    // --- INICIALIZAÇÃO E EVENT LISTENERS ---
    btnAplicarDesconto.addEventListener('click', handleAplicarDesconto);
    formAddCategoria.addEventListener('submit', handleAddCategoria);
    formAddComponente.addEventListener('submit', handleAddComponente);
    salvarOrcamentoBtn.addEventListener('click', salvarOrcamento);

    carregarDadosIniciais();
    iniciarNovoOrcamento();
});