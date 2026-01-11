import { text } from 'express';
import pool from './connect.js';

// execute query with error handling
export const query = async (text, params) => {

    try {
        const result = await pool.query(text, params);
        return result;
    } catch (error) {
        console.error('Database query error: ', error);
        throw error;
    }
};

// get single row
export const getOne = async (text, params) => {
    const result = await query (text, params);
    return result.rows[0] || null;
};

// get multiple rows
export  const  getMany = async (text, params)=>{
     const result = await query(text, params);
     return result.rows;
};

// Insert and return
export const insertAndReturn = async (text, params) => {
    const result = await query(text, params);
    return result.rows[0];
};

export default { query, getOne, getMany, insertAndReturn };