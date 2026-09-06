const { createPayment, markInitiated, getCustomerPayments } = require("./payment.service");

const create = async (req, res) => { try { const payment = await createPayment({ bookingId: Number(req.body.booking_id), customerId: req.user.id, provider: req.body.provider }); res.status(201).json({ success: true, payment }); } catch (e) { res.status(400).json({ success: false, message: e.message }); } };
const initiate = async (req, res) => { try { const payment = await markInitiated(Number(req.params.id), req.user.id); res.json({ success: true, payment }); } catch (e) { res.status(400).json({ success: false, message: e.message }); } };
const mine = async (req, res) => { try { res.json({ success: true, payments: await getCustomerPayments(req.user.id) }); } catch (e) { res.status(500).json({ success: false, message: e.message }); } };
module.exports = { create, initiate, mine };
