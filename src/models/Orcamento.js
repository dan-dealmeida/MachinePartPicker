// src/models/Orcamento.js
const EventEmitter = require('events');
const { PercentageDiscount, FixedValueDiscount } = require('../strategies/discountStrategies');

class Orcamento extends EventEmitter {
  constructor(nomeCliente) {
    super();
    this.id = null;
    this.nomeCliente = nomeCliente;
    this.itens = [];
    this.subTotal = 0;
    this.discountStrategy = null;
  }

  adicionarItem(item) {
    if (!item || typeof item.preco !== 'number') {
      console.error("Item inválido adicionado ao orçamento.");
      return;
    }
    this.itens.push(item);
    this.recalcularSubTotal();
    this.emit('update', this);
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
    this.emit('update', this);
  }

  getTotal() {
    const total = this.discountStrategy ? this.discountStrategy.applyDiscount(this.subTotal) : this.subTotal;
    return total;
  }
}

// A linha mais importante para corrigir o erro:
module.exports = Orcamento;