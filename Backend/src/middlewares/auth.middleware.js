import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import * as UserModel from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request!");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await UserModel.findUserById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    // Remove password and refresh_token from user  object
    delete user.password;
    delete user.refresh_token;

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token!");
  }
});

// Role-based authorization middleware
// Usage: authorizeRoles("MANAGER", "TECHNICIAN")
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Please login first");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Access denied. This action requires one of these roles: ${allowedRoles.join(", ")}`
      );
    }

    next();
  };
};