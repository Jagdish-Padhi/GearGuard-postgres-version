import dotenv from 'dotenv';
dotenv.config();
import pool from './database/connect.js';
import { app } from './app.js';

// Test database connections
pool.query('SELECT NOW()', (err, result) => {
    if (err) {
        console.error("Database connection failed: ", err);
        process.exit(1);
    } else {
        console.log('PostgreSQL connected successfully!');
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at PORT: ${process.env.PORT}`);
        });
    }
})