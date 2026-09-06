const PaymentProvider = require("./payment.provider");

const BASE_URL = process.env.KHALTI_BASE_URL || "https://dev.khalti.com/api/v2";

class KhaltiWebCheckout extends PaymentProvider {
  constructor() { super("Khalti"); }

  async createCheckout({ amountPaisa, purchaseOrderId, purchaseOrderName, returnUrl, websiteUrl }) {
    if (!process.env.KHALTI_SECRET_KEY) throw new Error("KHALTI_SECRET_KEY is not configured.");
    const response = await fetch(`${BASE_URL}/epayment/initiate/`, {
      method: "POST",
      headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amountPaisa, purchase_order_id: purchaseOrderId, purchase_order_name: purchaseOrderName, return_url: returnUrl, website_url: websiteUrl })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.message || "Khalti payment initiation failed.");
    return data;
  }

  async lookup(pidx) {
    if (!process.env.KHALTI_SECRET_KEY) throw new Error("KHALTI_SECRET_KEY is not configured.");
    const response = await fetch(`${BASE_URL}/epayment/lookup/`, {
      method: "POST",
      headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ pidx })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.message || "Khalti lookup failed.");
    return data;
  }
}

module.exports = KhaltiWebCheckout;
