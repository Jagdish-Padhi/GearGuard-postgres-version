import { Router } from "express";
import {
    getAllEquipment,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    scrapEquipment,
    getEquipmentRequests,
} from "../controllers/equipment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes are protected
router.use(verifyJWT);

router.get("/", getAllEquipment);
router.get("/:id", getEquipmentById);
router.post("/", createEquipment);
router.put("/:id", updateEquipment);
router.delete("/:id", deleteEquipment);

// Special routes
router.patch("/:id/scrap", scrapEquipment);
router.get("/:id/requests", getEquipmentRequests);

export default router;
