const pool = require("../../config/db");

const addProviderService = async ({ providerId, serviceId, price }) => {
  const result = await pool.query(`INSERT INTO provider_services (provider_id, service_id, price) VALUES ($1,$2,$3) ON CONFLICT (provider_id, service_id) DO UPDATE SET price=EXCLUDED.price, is_active=TRUE, updated_at=CURRENT_TIMESTAMP RETURNING *`, [providerId, serviceId, price ?? null]);
  return result.rows[0];
};
const getProviderServices = async (providerId) => {
  const result = await pool.query(`SELECT ps.id, ps.provider_id, ps.service_id, ps.price, ps.is_active, s.service_name, s.description, s.base_price, s.duration_minutes, c.category_name FROM provider_services ps JOIN services s ON s.id=ps.service_id JOIN service_categories c ON c.id=s.category_id WHERE ps.provider_id=$1 ORDER BY s.service_name ASC`, [providerId]);
  return result.rows;
};
const updateProviderService = async ({ providerId, serviceId, price, durationMinutes, isActive }) => {
  const values=[providerId,serviceId]; const fields=[];
  if(price!==undefined&&price!==null&&price!==""){const value=Number(price);if(!Number.isFinite(value)||value<0)throw new Error("Price must be a valid non-negative number.");values.push(value);fields.push(`price=$${values.length}`);}
  if(durationMinutes!==undefined&&durationMinutes!==null&&durationMinutes!==""){const value=Number(durationMinutes);if(!Number.isInteger(value)||value<15||value>480)throw new Error("Duration must be between 15 and 480 minutes.");values.push(value);fields.push(`duration_minutes=$${values.length}`);}
  if(isActive!==undefined){values.push(Boolean(isActive));fields.push(`is_active=$${values.length}`);}
  if(!fields.length)throw new Error("Provide a price, duration, or active status to update.");
  const result=await pool.query(`UPDATE provider_services ps SET ${fields.join(", ")}, updated_at=CURRENT_TIMESTAMP FROM services s WHERE ps.provider_id=$1 AND ps.service_id=$2 AND s.id=ps.service_id RETURNING ps.*, s.service_name`,values); return result.rows[0];
};
const deactivateProviderService = async ({providerId,serviceId}) => {const result=await pool.query(`UPDATE provider_services SET is_active=FALSE,updated_at=CURRENT_TIMESTAMP WHERE provider_id=$1 AND service_id=$2 RETURNING *`,[providerId,serviceId]);return result.rows[0];};
const setAvailability = async ({providerId,dayOfWeek,startTime,endTime}) => {const result=await pool.query(`INSERT INTO provider_availability (provider_id,day_of_week,start_time,end_time,is_available) VALUES ($1,$2,$3,$4,TRUE) ON CONFLICT (provider_id,day_of_week,start_time,end_time) DO UPDATE SET is_available=TRUE RETURNING *`,[providerId,dayOfWeek,startTime,endTime]);return result.rows[0];};
const getAvailability = async providerId => {const result=await pool.query(`SELECT id,provider_id,day_of_week,start_time,end_time,is_available FROM provider_availability WHERE provider_id=$1 AND is_available=TRUE ORDER BY day_of_week,start_time`,[providerId]);return result.rows;};
module.exports={addProviderService,getProviderServices,updateProviderService,deactivateProviderService,setAvailability,getAvailability};