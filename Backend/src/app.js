import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { globalErrorHandler } from './utils/globalErrorHandler.js';

const app = express();

// CORS configuration
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all for development
        }
    },
    credentials: true,
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// routes - NOTE: Using /api/v1 to match frontend
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import equipmentRoutes from './routes/equipment.route.js';
import teamRoutes from './routes/team.route.js';
import requestRoutes from './routes/request.route.js';

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/equipment', equipmentRoutes);
app.use('/api/v1/teams', teamRoutes);
app.use('/api/v1/requests', requestRoutes);

// error handler
app.use(globalErrorHandler);

export { app };