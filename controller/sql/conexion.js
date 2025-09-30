const pool = require('../config/dbsettings');

async function connectToDatabase() {
    try {
        const connection = await pool.getConnection(); // Get a connection from the pool
        console.log("Connected to the database!");

        connection.release(); // Release the connection back to the pool
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
}

connectToDatabase();

module.exports = connectToDatabase;