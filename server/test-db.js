const pool = require('./config/db');

async function test() {
  const result = await pool.query('SELECT NOW()');
  console.log(result.rows[0]);
  process.exit();
}

test();