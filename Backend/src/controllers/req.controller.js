import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import * as RequestModel from "../models/request.model.js";
import * as EquipmentModel from "../models/equipment.model.js";

export const getAllRequests = asyncHandler(async (req, res, next) => {
    const filters = {};

    if (req.query.status) filters.status = req.query.status;
    if (req.query.priority) filters.priority = req.query.priority;
    if (req.query.type) filters.type = req.query.type;
    if (req.query.assignedTeam) filters.assignedTeam = req.query.assignedTeam;
    if (req.query.equipment) filters.equipment = req.query.equipment;

    const requests = await RequestModel.getAllRequests(filters);

    return res
        .status(200)
        .json(new ApiResponse(200, requests, "Requests fetched successfully"));
});

export const getRequestById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const request = await RequestModel.getRequestById(id);

    if (!request) {
        throw new ApiError(404, "Request not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, request, "Request fetched successfully"));
});

export const createRequest = asyncHandler(async (req, res, next) => {
    const { title, description, type, priority, equipment, scheduledDate } = req.body;

    if (!title || !description || !type || !equipment) {
        throw new ApiError(400, "Title, description, type and equipment are required");
    }

    if (!["CORRECTIVE", "PREVENTIVE"].includes(type)) {
        throw new ApiError(400, "Type must be CORRECTIVE or PREVENTIVE");
    }

    if (type === "PREVENTIVE" && !scheduledDate) {
        throw new ApiError(400, "Scheduled date is required for preventive maintenance");
    }

    const equipmentDoc = await EquipmentModel.getEquipmentById(equipment);
    if (!equipmentDoc) {
        throw new ApiError(404, "Equipment not found");
    }

    if (equipmentDoc.status === "SCRAPPED") {
        throw new ApiError(400, "Cannot create request for scrapped equipment");
    }

    const assignedTeam = equipmentDoc.assigned_team_id || null;

    const request = await RequestModel.createRequest({
        title,
        description,
        type,
        priority: priority || "MEDIUM",
        equipment,
        assignedTeam,
        requestedBy: req.user.id,
        scheduledDate: type === "PREVENTIVE" ? scheduledDate : null,
    });

    const populatedRequest = await RequestModel.getRequestById(request.id);

    return res
        .status(201)
        .json(new ApiResponse(201, populatedRequest, "Request created successfully"));
});

export const updateRequest = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { title, description, priority, scheduledDate } = req.body;

    const request = await RequestModel.getRequestById(id);

    if (!request) {
        throw new ApiError(404, "Request not found");
    }

    if (request.requested_by !== req.user.id && req.user.role !== "MANAGER") {
        throw new ApiError(403, "You are not authorized to update this request");
    }

    await RequestModel.updateRequest(id, {
        title,
        description,
        priority,
        scheduledDate
    });

    const updatedRequest = await RequestModel.getRequestById(id);

    return res
        .status(200)
        .json(new ApiResponse(200, updatedRequest, "Request updated successfully"));
});

export const deleteRequest = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const request = await RequestModel.getRequestById(id);

    if (!request) {
        throw new ApiError(404, "Request not found");
    }

    if (request.requested_by !== req.user.id && req.user.role !== "MANAGER") {
        throw new ApiError(403, "You are not authorized to delete this request");
    }

    await RequestModel.deleteRequest(id);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Request deleted successfully"));
});

export const updateStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status, duration } = req.body;

    if (!status) {
        throw new ApiError(400, "Status is required");
    }

    if (!["NEW", "IN_PROGRESS", "REPAIRED", "SCRAP"].includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    const request = await RequestModel.getRequestById(id);

    if (!request) {
        throw new ApiError(404, "Request not found");
    }

    if (status === "REPAIRED" && !duration) {
        throw new ApiError(400, "Duration is required when marking as repaired");
    }

    await RequestModel.updateRequestStatus(id, status, duration || null);

    const updatedRequest = await RequestModel.getRequestById(id);

    return res
        .status(200)
        .json(new ApiResponse(200, updatedRequest, "Status updated successfully"));
});

export const getRequestsByStatus = asyncHandler(async (req, res, next) => {
    const requests = await RequestModel.getRequestsByStatus();

    const result = {
        NEW: [],
        IN_PROGRESS: [],
        REPAIRED: [],
        SCRAP: []
    };

    requests.forEach(req => {
        if (result[req.status]) {
            result[req.status].push(req);
        }
    });

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Kanban data fetched successfully"));
});

export const getPreventiveRequests = asyncHandler(async (req, res, next) => {
    const { month, year } = req.query;

    const requests = await RequestModel.getPreventiveRequests({ month, year });

    return res
        .status(200)
        .json(new ApiResponse(200, requests, "Preventive requests fetched successfully"));
});