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
module.exports = { PercentageDiscount, FixedValueDiscount };