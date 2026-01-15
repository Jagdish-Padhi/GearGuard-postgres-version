import { query, getOne, getMany, insertAndReturn } from '../database/queryHelper.js';

// Create payment
export const createPayment = async (data) => {
    const {
        userId,
        equipmentId,
        requestId,
        razorpayOrderId,
        amount,
        currency,
        paymentType,
        description
    } = data;

    const text = `
    INSERT INTO payments(
    user_id, equipment_id, request_id, razorpay_order_id, amount, currency, status, payment_type, description) 
    VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7, $8) RETURNING *`;

    return insertAndReturn(text, [
        userId,
        equipmentId || null,
        requestId || null,
        razorpayOrderId,
        amount,
        currency || 'INR',
        paymentType,
        description
    ]);
};

// Get payment by razorpay order ID
export const getPaymentByOrderId = async (razorpayOrderId) => {
    const text = `SELECT * FROM payments WHERE razorpay_order_id = $1`;
    return getOne(text, [razorpayOrderId]);
};

// Get payment by ID
export const getPaymentById = async (id) => {
    const text = `
    SELECT p.*, u.username, u.email, u.full_name,
    e.name as equipment_name,
    r.title as request_title
    FROM payments p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN equipment e ON p.equipment_id = e.id
    LEFT JOIN requests r ON p.request_id = r.id
    WHERE p.id = $1`;

    return getOne(text, [id]);
}

// update payments with rozarpay details
export const updatePaymentWithRazorpay = async (id, data) => {
    const { razorpayPaymentId, razorpaySignature, status } = data;

    const text = `
    UPDATE payments
    SET razorpay_payment_id = $1,
    razorpay_signature = $2,
    status = $3,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *`;

    return insertAndReturn(text, [razorpayPaymentId, razorpaySignature, status, id]);

}

// Get all payments for a user
export const getUserPayments = async(userId, filters = {}) => {
    let text = `
    SELECT P.*,
    e.name as equipment_name,
    r.title as request_title
    FROM payments p
    LEFT JOIN equipment e ON p.equipment_id = e.id
    LEFT JOIN requests r ON p.request_id = r.id
    WHERE p.user_id = $1`;

    const params = [userId];
    let paramIndex = 2;

    if(filters.status){
        text += ` AND p.status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;

    }

    if(filters.paymentType){
        text += ` AND p.payment_type = $${paramIndex}`;
        params.push(filters.paymentType);
        paramIndex++;
    }

    text += ` ORDER BY p.created_at DESC`;

    return getMany(text, params);

};


// Get all payments (for admins)
export const getAllPayments = async (filters) => {
    let text = `
    SELECT p.*, u.username, u.email, u.full_name,
    e.name as equipment_name,
    r.title as request_title
    FROM payments p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN equipment e ON p.equiment_id = e.id
    LEFT JOIN requests r ON p.request_id  = r.id
    WHERE 1=1`;

    const params = [];
    let paramIndex = 1;

    if (filters.status) {
        text += ` AND p.status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
    }
    if (filters.paymentType) {
        text += ` AND p.payment_type = $${paramIndex}`;
        params.push(filters.paymentType);
        paramIndex++;
    }
    if (filters.userId) {
        text += ` AND p.userId = $${paramIndex}`;
        params.push(filters.userId);
        paramIndex++;
    }

    text += ` ORDER BY p.created_at DESC`;

    return getMany(text, params.length > 0 ? params : []);

}

// Get payment statistics
export const getPaymentStats = async () => {
    const text = `
    SELECT COUNT (*) as total_transactions,
    SUM(CASE WHEN status = 'COMPLETED' THEN amount ELSE 0 END) as total_completed,
    SUM(CASE WHEN status = 'PENDING' THEN amount ELSE 0 END) as total_pending,
    SUM(CASE WHEN status = 'FAILED' THEN amount ELSE 0 END) as total_failed,
    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_count,
    COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_count
    FROM payments`;

    return getOne(text, []);
}

// Update payment status
export const updatePaymentStatus = async (id, status) => {
    const text = `
    UPDATE payments
    SET status = $1, 
    updated_at = CURRENT_TIMESTAMP
    WHERE  id = $2
    RETURNING *`;
    return insertAndReturn(text, [status, id]);
}