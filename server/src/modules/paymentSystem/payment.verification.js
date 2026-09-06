const crypto = require("crypto");
const pool = require("../../config/db");
const { markPaidAfterVerification } = require("../payment/payment.service");
const { createNotification } = require("../notification/notification.service");

const verifyAndCompletePayment = async ({ paymentId, provider, transactionId, providerReference, verifiedAmount }) => {
  const paymentResult = await pool.query("SELECT * FROM payments WHERE id=$1 FOR UPDATE", [paymentId]);
  const payment = paymentResult.rows[0];
  if (!payment) throw new Error("Payment not found.");
  if (payment.provider !== provider) throw new Error("Payment provider mismatch.");

  if (Number(verifiedAmount) !== Number(payment.amount)) {
    throw new Error("Verified payment amount does not match the booking amount.");
  }

  const paid = await markPaidAfterVerification({ paymentId, provider, transactionId, providerReference });
  if (paid?.booking_id) {
    const booking = await pool.query("SELECT customer_id FROM bookings WHERE id=$1", [paid.booking_id]);
    const customerId = booking.rows[0]?.customer_id;
    if (customerId) {
      await createNotification({
        userId: customerId,
        bookingId: paid.booking_id,
        type: "payment.paid",
        title: "Payment confirmed",
        message: `Payment for booking #${paid.booking_id} has been verified successfully.`,
      });
    }
  }
  return paid;
};

const signatureFor = (payload, secret) => crypto.createHmac("sha256", secret).update(payload).digest("hex");

module.exports = { verifyAndCompletePayment, signatureFor };
