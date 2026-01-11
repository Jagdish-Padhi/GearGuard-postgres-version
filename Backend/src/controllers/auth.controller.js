import * as UserModel from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Cookie options
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
};

// Generate tokens helper
const generateTokens = async (user) => {

    const accessToken = UserModel.generateAccessToken(user);
    const refreshToken = UserModel.generateRefreshToken(user);

    await UserModel.updateRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
};

// Register
export const register = asyncHandler(async (req, res) => {
    const { username, password, email, fullName, role } = req.body;

    if (!username || !email || !fullName || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await UserModel.findUserByEmailOrUsername(email, username);
    if (existingUser) {
        throw new ApiError(400, "User with email or username already exists");
    }

    const user = await UserModel.createUser({
        username, email, fullName, password, role: role || 'USER',
    });

    res.status(201).json(
        new ApiResponse(201, user, "User registered successfully!")
    );
});

// Login
export const login = asyncHandler(
    async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new ApiError(400, "Email and password are required");
        }

        const user = await UserModel.findUserByEmail(email);

        if (!user) {
            throw new ApiError(401, "Invalid email or password");
        }

        const isPasswordValid = await UserModel.isPasswordCorrect(password, user.password);
        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid email or password");
        }

        const { accessToken, refreshAccessToken } = await generateTokens(user);

        const loggedInUser = await UserModel.findUserById(user.id);

        res.status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser,
                        accessToken,
                        refreshToken,
                    },
                    "User logged in successfully!"
                )
            );
    }
);

// Logout
export const logout = asyncHandler(async (req, res) => {
    await UserModel.updateRefreshToken(req.user.id, null);

    return res.status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully!"))

});

// Refresh token
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET
        );

        const user = await UserModel.findUserById(decodedToken.id);

        if (!user || incomingRefreshToken !== user.refresh_token) {
            throw new ApiError(401, "Invalid refresh token");
        }

        const { accessToken, refreshToken } = await generateTokens(user);

        return res.status(200).cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(new ApiResponse(
                200, { accessToken, refreshToken },
                "Access token refreshed..."
            ));
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }

});