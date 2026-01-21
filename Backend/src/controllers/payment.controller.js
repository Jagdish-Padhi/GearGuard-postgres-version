import Razorpay from 'razorpay';
import crypto from 'crypto';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import * as PaymentModel from "../models/payment.model.js";
import * as EquipmentModel from "../models/equipment.model.js";
import * as RequestModel from "../models/request.model.js";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay Order
export const createRazorpayOrder = asyncHandler(async (req, res) => {
    const { amount, description, paymentType, equipmentId, requestId } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!amount || !description || !paymentType) {
        throw new ApiError(400, "Amount, description, and paymentType are required");
    }

    if (!['RENTAL', 'SERVICE', 'SUBSCRIPTION'].includes(paymentType)) {
        throw new ApiError(400, "Invalid payment type");
    }

    // Validate equipment exists if rental
    if (paymentType === 'RENTAL' && equipmentId) {
        const equipment = await EquipmentModel.getEquipmentById(equipmentId);
        if (!equipment) {
            throw new ApiError(404, "Equipment not found");
        }
        if (equipment.status === 'SCRAPPED') {
            throw new ApiError(400, "Cannot rent scrapped equipment");
        }
    }

    // Validate request exists if service payment
    if (paymentType === 'SERVICE' && requestId) {
        const maintenanceRequest = await RequestModel.getRequestById(requestId);
        if (!maintenanceRequest) {
            throw new ApiError(404, "Request not found");
        }
    }

    // Create Razorpay order
    const razorpayOrderOptions = {
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
            description,
            paymentType,
            userId
        }
    };

    try {
        const razorpayOrder = await razorpay.orders.create(razorpayOrderOptions);

        // Save payment in database
        const payment = await PaymentModel.createPayment({
            userId,
            equipmentId: equipmentId || null,
            requestId: requestId || null,
            razorpayOrderId: razorpayOrder.id,
            amount,
            currency: 'INR',
            paymentType,
            description
        });

        return res.status(201).json(
            new ApiResponse(201, {
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                paymentId: payment.id,
                keyId: process.env.RAZORPAY_KEY_ID
            }, "Razorpay order created successfully")
        );
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        throw new ApiError(500, "Failed to create payment order");
    }
});

// Verify Payment
export const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        throw new ApiError(400, "Missing required payment verification details");
    }

    // Get payment from database
    const payment = await PaymentModel.getPaymentByOrderId(razorpayOrderId);
    if (!payment) {
        throw new ApiError(404, "Payment record not found");
    }

    // Verify signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

    if (generatedSignature !== razorpaySignature) {
        // Update payment status to failed
        await PaymentModel.updatePaymentStatus(payment.id, 'FAILED');
        throw new ApiError(400, "Payment verification failed - Invalid signature");
    }

    // Verify payment with Razorpay API
    try {
        const razorpayPayment = await razorpay.payments.fetch(razorpayPaymentId);

        if (razorpayPayment.status !== 'captured') {
            await PaymentModel.updatePaymentStatus(payment.id, 'FAILED');
            throw new ApiError(400, "Payment not captured by Razorpay");
        }

        // Update payment status to completed
        const updatedPayment = await PaymentModel.updatePaymentWithRazorpay(
            payment.id,
            {
                razorpayPaymentId,
                razorpaySignature,
                status: 'COMPLETED'
            }
        );

        // If rental, you could create a rental record
        // If service, you could update the request status
        if (payment.payment_type === 'SERVICE' && payment.request_id) {
            // Update request status to completed/paid
            await RequestModel.updateRequest(payment.request_id, {
                status: 'COMPLETED'
            });
        }

        return res.status(200).json(
            new ApiResponse(200, updatedPayment, "Payment verified successfully")
        );
    } catch (error) {
        console.error('Payment verification error:', error);
        await PaymentModel.updatePaymentStatus(payment.id, 'FAILED');
        throw new ApiError(500, "Payment verification failed");
    }
});

// Get user payments
export const getUserPayments = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { status, paymentType } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (paymentType) filters.paymentType = paymentType;

    const payments = await PaymentModel.getUserPayments(userId, filters);

    return res.status(200).json(
        new ApiResponse(200, payments, "User payments fetched successfully")
    );
});

// Get all payments (admin only)
export const getAllPayments = asyncHandler(async (req, res) => {
    const { status, paymentType, userId } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (paymentType) filters.paymentType = paymentType;
    if (userId) filters.userId = userId;

    const payments = await PaymentModel.getAllPayments(filters);

    return res.status(200).json(
        new ApiResponse(200, payments, "All payments fetched successfully")
    );
});

// Get payment by ID
export const getPaymentById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const payment = await PaymentModel.getPaymentById(id);
    if (!payment) {
        throw new ApiError(404, "Payment not found");
    }

    // Check authorization - user can only view their own payments unless admin
    if (req.user.role !== 'MANAGER' && payment.user_id !== req.user.id) {
        throw new ApiError(403, "Unauthorized to view this payment");
    }

    return res.status(200).json(
        new ApiResponse(200, payment, "Payment fetched successfully")
    );
});

// Get payment statistics (admin only)
export const getPaymentStats = asyncHandler(async (req, res) => {
    const stats = await PaymentModel.getPaymentStats();

    return res.status(200).json(
        new ApiResponse(200, stats, "Payment statistics fetched successfully")
    );
});

// Refund payment (admin only)
export const refundPayment = asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    const { reason } = req.body;

    const payment = await PaymentModel.getPaymentById(paymentId);
    if (!payment) {
        throw new ApiError(404, "Payment not found");
    }

    if (payment.status !== 'COMPLETED') {
        throw new ApiError(400, "Only completed payments can be refunded");
    }

    try {
        // Process refund with Razorpay
        const refund = await razorpay.payments.refund(payment.razorpay_payment_id, {
            amount: Math.round(payment.amount * 100),
            notes: {
                reason: reason || 'Admin refund'
            }
        });

        // Update payment status
        const updatedPayment = await PaymentModel.updatePaymentStatus(paymentId, 'REFUNDED');

        return res.status(200).json(
            new ApiResponse(200, updatedPayment, "Payment refunded successfully")
        );
    } catch (error) {
        console.error('Refund error:', error);
        throw new ApiError(500, "Failed to process refund");
    }
});

