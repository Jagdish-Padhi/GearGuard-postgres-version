import bcrypt, { hash } from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { query, getOne, getMany, insertAndReturn } from "../database/queryHelper";
import { text } from "express";

dotenv.config();

// Create User
export const createUser = async (userData) => {
    const { username, email, fullName, password, role = 'USER' } = userData;

    const hashedPassword = await bcrypt.hash(password, 10);

    const text = `
    INSERT INTO users (username, email, full_name, password, role)
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING id, username, email, full_name, role, created_at`;

    return insertAndReturn(text, [username, email, fullName, hashedPassword, role]);
};

// Find user by email
export const findUserByEmail = async (email) => {
    const text = `SELECT * FROM users WHERE email = $1`;
    return getOne(text, [email]);
};

// Find user by username
export const findUserByUsername = async (username) => {
    const text = `SELECT * FROM users WHERE username = $1`;
    return getOne(text, [username]);
};

// Find user by email or username
export const findUserByEmailOrUsername = async (email, username) => {
    const text = `SELECT * FROM users WHERE email = $1 OR username = $2`;
    return getOne(text, [email, username]);
};

// Get all users
export const getAllUsers = async (role = null) => {
    let text = `SELECT id, username, email, full_name, role, created_at FROM users`;
    let params = [];

    if (role) {
        text += ` WHERE role = $1`;
        params = [role];
    }

    text += ` ORDER BY created_at DESC`;
    return getMany(text, params);
};

// Get all technicians
export const getAllTechnicians = async () => {
    const text = ` SELECT id, username, email, full_name FROM users WHERE role = 'TECHNICIAN' ORDER BY full_name`;
    return getMany(text, []);
};

// Update user
export const updatedUser = async (id, updateData) => {
    const { fullName, email } = updateData;
    const text = `
    UPDATE users
    SET full_name = COALESCE($1, full_name ), 
    email = COALESCE($2, email),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING id, username, email, full_name, role, created_at, updated_at`;

    return insertAndReturn(text, [fullName || null, email || null, id]);

}

// Update password
export const updatePassword = async (id, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const text = `
    UPDATE users
    SET password = $1,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, username, email, full_name, role`;

    return insertAndReturn(text, [hashedPassword, id]);
};

// Update refresh token 
export const updateRefreshToken = async (id, refreshToken) => {
    const text = `
    UPDATE users
    SET refresh_token = $1
    WHERE id = $2`;

    return query(text, [refreshToken, id]);;
}

// check password
export const isPasswordCorrect = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

// JWT token generators
export const generateAccessToken = (user) => {
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.full_name,
        role: user.role,
    },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' });
};

export const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
    );
};