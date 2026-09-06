const pool = require("../../config/db");
const { canTransition } = require("./booking.lifecycle");
const { createNotification } = require("../notification/notification.service");
const { EVENTS, eventForStatus } = require("./booking.notification");
const { recordCompletedBooking } = require("../earnings/earnings.service");

const isAdmin = (user) => user?.role === "admin" || user?.role_name === "admin";
const VALID_STATUSES = ["Pending", "Accepted", "In Progress", "Completed", "Cancelled"];

const createBooking = async ({ customer_id, provider_id, service_id, booking_date, booking_time, address, notes }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const provider = await client.query("SELECT id, user_id FROM providers WHERE id=$1", [provider_id]);
    if (!provider.rows[0]) throw new Error("Provider not found.");
    const service = await client.query(
      `SELECT s.id, s.duration_minutes, COALESCE(ps.price, s.base_price) AS provider_price
       FROM services s LEFT JOIN provider_services ps ON ps.service_id=s.id AND ps.provider_id=$2 AND ps.is_active=TRUE
       WHERE s.id=$1`, [service_id, provider_id]
    );
    if (!service.rows[0]) throw new Error("Service not found.");
    if (service.rows[0].provider_price === null || service.rows[0].provider_price === undefined) throw new Error("This provider does not offer the selected service.");
    const duration = Number(service.rows[0].duration_minutes || 60);

    const availability = await client.query("SELECT provider_is_available($1,$2,$3) AS available", [provider_id, booking_date, booking_time]);
    if (!availability.rows[0]?.available) throw new Error("Provider is not available at the selected date and time.");

    const conflict = await client.query(
      `SELECT b.id FROM bookings b JOIN services existing_service ON existing_service.id=b.service_id
       WHERE b.provider_id=$1 AND b.booking_date=$2 AND b.status IN ('Pending','Accepted','In Progress')
       AND $3::time < (b.booking_time + (existing_service.duration_minutes || ' minutes')::interval)
       AND b.booking_time < ($3::time + ($4 || ' minutes')::interval) LIMIT 1 FOR UPDATE OF b`,
      [provider_id, booking_date, booking_time, duration]
    );
    if (conflict.rows[0]) throw new Error("This provider is already booked during the selected time.");

    const result = await client.query(
      `INSERT INTO bookings (customer_id, provider_id, service_id, booking_date, booking_time, address, notes, total_amount, status)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,'Pending') RETURNING *`,
      [customer_id, provider_id, service_id, booking_date, booking_time, address, notes, service.rows[0].provider_price]
    );
    const booking = result.rows[0]; await client.query("COMMIT");
    if (provider.rows[0]?.user_id) await createNotification({ userId: provider.rows[0].user_id, bookingId: booking.id, type: EVENTS.CREATED, title: "New booking request", message: "You have received a new service booking request." });
    return booking;
  } catch (error) { try { await client.query("ROLLBACK"); } catch (_) {} throw error; }
  finally { client.release(); }
};

const getAllBookings = async (user) => { const values=[]; let filter=""; if(!isAdmin(user)){values.push(user.id);filter=`WHERE b.customer_id=$1 OR EXISTS (SELECT 1 FROM providers p2 WHERE p2.id=b.provider_id AND p2.user_id=$1)`;} const result=await pool.query(`SELECT b.id,u.full_name AS customer,p.business_name AS provider,s.service_name,s.duration_minutes,b.booking_date,b.booking_time,b.address,b.total_amount,b.status,b.customer_id,b.provider_id,b.service_id FROM bookings b JOIN users u ON b.customer_id=u.id JOIN providers p ON b.provider_id=p.id JOIN services s ON b.service_id=s.id ${filter} ORDER BY b.id DESC`,values);return result.rows;};
const getBookingById = async (id,user) => {const values=[id];let access="";if(!isAdmin(user)){values.push(user.id);access=`AND (b.customer_id=$2 OR EXISTS (SELECT 1 FROM providers p2 WHERE p2.id=b.provider_id AND p2.user_id=$2))`;}const result=await pool.query(`SELECT b.* FROM bookings b WHERE b.id=$1 ${access}`,values);return result.rows[0];};
const updateBookingStatus = async (id,status,user) => {const booking=await getBookingById(id,user);if(!booking)throw new Error("Booking not found or you are not authorized.");if(!VALID_STATUSES.includes(status))throw new Error("Invalid booking status.");if(!isAdmin(user)){if(!canTransition(booking.status,status))throw new Error(`Invalid status transition: ${booking.status} → ${status}`);const provider=await pool.query("SELECT id FROM providers WHERE id=$1 AND user_id=$2",[booking.provider_id,user.id]);if(!provider.rows[0])throw new Error("Only the assigned provider can update this booking.");}const result=await pool.query("UPDATE bookings SET status=$1 WHERE id=$2 RETURNING *",[status,id]);const updated=result.rows[0];if(status==="Completed"&&booking.status!=="Completed")await recordCompletedBooking(updated);const event=eventForStatus(status);if(event&&updated.customer_id)await createNotification({userId:updated.customer_id,bookingId:updated.id,type:event,title:{Accepted:"Booking accepted","In Progress":"Service in progress",Completed:"Service completed",Cancelled:"Booking cancelled"}[status],message:`Your booking #${updated.id} is now ${status.toLowerCase()}.`});return updated;};
const deleteBooking = async (id,user) => {const values=[id];let access="";if(!isAdmin(user)){values.push(user.id);access="AND customer_id=$2";}const result=await pool.query(`DELETE FROM bookings WHERE id=$1 ${access} RETURNING id`,values);if(!result.rows[0])throw new Error("Booking not found or you are not authorized.");};
module.exports={createBooking,getAllBookings,getBookingById,updateBookingStatus,deleteBooking};