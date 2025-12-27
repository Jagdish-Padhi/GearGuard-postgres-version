import { Router } from "express";
import {
    getAllTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam,
    addTechnician,
    removeTechnician,
} from "../controllers/team.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes are protected
router.use(verifyJWT);

router.get("/", getAllTeams);
router.get("/:id", getTeamById);
router.post("/", createTeam);
router.put("/:id", updateTeam);
router.delete("/:id", deleteTeam);

// Technician management
router.post("/:id/technicians", addTechnician);
router.delete("/:id/technicians", removeTechnician);

export default router;
