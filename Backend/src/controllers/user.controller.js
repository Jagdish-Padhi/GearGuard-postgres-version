import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import * as UserModel from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Get current user
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

// Update account details
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName && !email) {
        throw new ApiError(400, "At least one field is required");
    }

    const user = await UserModel.updatedUser(req.user.id, { fullName, email })

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));
});

// Change password
const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old and new password are required");
    }

    const user = await UserModel.findById(req.user._id);

    const isPasswordValid = await user.isPasswordCorrect(oldPassword, user.password);

    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid old password");
    }

    await UserModel.updatePassword(user.id, newPassword)

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Get all technicians (for team assignment)
const getAllTechnicians = asyncHandler(async (req, res) => {
    const technicians = await UserModel.getAllTechnicians();

    return res
        .status(200)
        .json(new ApiResponse(200, technicians, "Technicians fetched successfully"));
});

// Get all users (with optional role filter)
const getAllUsers = asyncHandler(async (req, res) => {
    const role = req.query.role || null;

    const users = await UserModel.getAllUsers(role);

    return res
        .status(200)
        .json(new ApiResponse(200, users, "Users fetched successfully"));
});

export {
    getCurrentUser,
    updateAccountDetails,
    changePassword,
    getAllTechnicians,
    getAllUsers,
};