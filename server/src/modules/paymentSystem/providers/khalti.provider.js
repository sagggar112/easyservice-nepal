const PaymentProvider = require("./payment.provider");

class KhaltiProvider extends PaymentProvider {
  constructor() { super("Khalti"); }

  async createCheckout() {
    // Implement against Khalti's current gateway API using server-side credentials.
    // Credentials must come from environment variables, never from React/client code.
    if (!process.env.KHALTI_SECRET_KEY) throw new Error("Khalti is not configured. Set KHALTI_SECRET_KEY on the server.");
    throw new Error("Khalti checkout adapter requires gateway configuration before live payments are enabled.");
  }

  async verifyPayment() {
    if (!process.env.KHALTI_SECRET_KEY) throw new Error("Khalti is not configured. Set KHALTI_SECRET_KEY on the server.");
    throw new Error("Khalti verification adapter requires gateway configuration before live payments are enabled.");
  }
}

module.exports = KhaltiProvider;
