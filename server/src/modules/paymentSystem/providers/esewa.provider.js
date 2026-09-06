const PaymentProvider = require("./payment.provider");

class EsewaProvider extends PaymentProvider {
  constructor() { super("eSewa"); }

  async createCheckout() {
    if (!process.env.ESEWA_SECRET_KEY) throw new Error("eSewa is not configured. Set ESEWA_SECRET_KEY on the server.");
    throw new Error("eSewa checkout adapter requires gateway configuration before live payments are enabled.");
  }

  async verifyPayment() {
    if (!process.env.ESEWA_SECRET_KEY) throw new Error("eSewa is not configured. Set ESEWA_SECRET_KEY on the server.");
    throw new Error("eSewa verification adapter requires gateway configuration before live payments are enabled.");
  }
}

module.exports = EsewaProvider;
