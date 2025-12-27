import { Router } from "express";
import {
    getAllRequests,
    getRequestById,
    createRequest,
    updateRequest,
    deleteRequest,
    updateStatus,
    getRequestsByStatus,
    getPreventiveRequests,
} from "../controllers/req.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes are protected
router.use(verifyJWT);

// Special routes (put before /:id to avoid conflicts)
router.get("/kanban", getRequestsByStatus);
router.get("/preventive", getPreventiveRequests);

// CRUD routes
router.get("/", getAllRequests);
router.get("/:id", getRequestById);
router.post("/", createRequest);
router.put("/:id", updateRequest);
router.delete("/:id", deleteRequest);

// Status update (for Kanban drag-drop)
router.patch("/:id/status", updateStatus);

export default router;
