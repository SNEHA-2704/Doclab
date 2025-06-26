const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

// Create a connection to the MySQL server
const connection = mysql.createConnection({
    port: process.env.MYSQL_PORT,
    host: 'localhost',
    user: 'root',
    password: process.env.MYSQL_PASSWORD,
    database: 'doclab'
});

// Connect to the MySQL server
const connect = () => {
    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL server:', err);
            return;
        }
        console.log('Connected to MySQL server');
    });
}

module.exports = {connect, connection};