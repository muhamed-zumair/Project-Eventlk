const {Pool} = require('pg');
require('dotenv').config();

//creating a new connection using the url from the .env file
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
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