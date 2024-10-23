import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfigDev = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

const dbConfigProd = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    socketPath: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
    waitForConnections: true,
    connectionLimit: 10,
};

export const dbPool = mysql.createPool(process.env.MODE === 'DEV' ? dbConfigDev : dbConfigProd);