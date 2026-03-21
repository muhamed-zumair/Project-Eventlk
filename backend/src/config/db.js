const {Pool} = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  // 🚀 Increase these for heavy AI-assisted data
  statement_timeout: 15000,      // Give it 15 seconds to delete everything
  connectionTimeoutMillis: 10000, 
  idle_in_transaction_session_timeout: 15000 
});

// 🚀 CRITICAL: This stops the "node:events:486" crash you saw!
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});



//testing the connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client: Database connection failed', err.stack);
    }
    console.log('Database connected to SupaBase PostgreSQLsuccessfully!');
    release();//release the client back to the pool
});

module.exports = pool;