import { Router } from "express";
import {
    getCurrentUser,
    updateAccountDetails,
    changePassword,
    getAllTechnicians,
    getAllUsers,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All user routes are protected
router.use(verifyJWT);

router.get("/me", getCurrentUser);
router.get("/technicians", getAllTechnicians);
router.get("/", getAllUsers);
router.patch("/update", updateAccountDetails);
router.post("/change-password", changePassword);

export default router;