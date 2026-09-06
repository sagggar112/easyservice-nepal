class PaymentProvider {
  constructor(name) { this.name = name; }

  async createCheckout() {
    throw new Error(`${this.name} checkout adapter is not configured yet.`);
  }

  async verifyPayment() {
    throw new Error(`${this.name} verification adapter is not configured yet.`);
  }
}

module.exports = PaymentProvider;
