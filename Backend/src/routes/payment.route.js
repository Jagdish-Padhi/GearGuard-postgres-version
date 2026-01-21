import { Router } from 'express';
import {
    createRazorpayOrder,
    verifyPayment,
    getUserPayments,
    getAllPayments,
    getPaymentById,
    getPaymentStats,
    refundPayment
} from '../controllers/payment.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Create payment order
router.post('/create-order', createRazorpayOrder);

// Verify payment
router.post('/verify', verifyPayment);

// Get user payments
router.get('/my-payments', getUserPayments);

// Get payment by ID
router.get('/:id', getPaymentById);

// Admin routes
router.get('/', authorizeRoles('MANAGER'), getAllPayments);
router.get('/stats/overview', authorizeRoles('MANAGER'), getPaymentStats);
router.post('/:paymentId/refund', authorizeRoles('MANAGER'), refundPayment);

export default router;