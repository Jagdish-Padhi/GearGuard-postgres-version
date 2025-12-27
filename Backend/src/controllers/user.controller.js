import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
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

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                ...(fullName && { fullName }),
                ...(email && { email }),
            },
        },
        { new: true }
    ).select("-password -refreshToken");

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

    const user = await User.findById(req.user._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Get all technicians (for team assignment)
const getAllTechnicians = asyncHandler(async (req, res) => {
    const technicians = await User.find({ role: "TECHNICIAN" })
        .select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, technicians, "Technicians fetched successfully"));
});

// Get all users (with optional role filter)
const getAllUsers = asyncHandler(async (req, res) => {
    const filter = {};
    
    if (req.query.role) {
        filter.role = req.query.role;
    }

    const users = await User.find(filter)
        .select("-password -refreshToken");

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