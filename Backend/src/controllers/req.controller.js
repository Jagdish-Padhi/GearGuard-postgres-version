import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Request } from "../models/request.model.js";

export const getAllRequests = asyncHandler(
    async (req, res, next) => {

        // filter as per query params
        const filter = {};

        if (req.query.status) {
            filter.status = req.query.status;
        }
        if (req.query.priority) {
            filter.priority = req.query.priority;
        }
        if (req.query.assignedTo) {
            filter.assignedTo = req.query.assignedTo;
        }

        // fetch req from db 
        const requests = await Request.find(filter)
            .populate("requestedBy", "fullName email")
            .populate("assignedTo", "fullName email")
            .sort({ createdAt: -1 });

        return res.status(200).json(new ApiResponse(200, requests, "Requests fetched successfully!"));
    }
);
