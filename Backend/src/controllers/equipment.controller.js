import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import * as EquipmentModel from "../models/equipment.model.js";
import * as RequestModel from "../models/request.model.js";


export const getAllEquipment = asyncHandler(async (req, res, next) => {
    const filters = {};

    if (req.query.status) {
        filters.status = req.query.status;
    }
    if (req.query.location) {
        filters.location = req.query.location;
    }

    const equipment = await EquipmentModel.getAllEquipment(filters);

    return res
        .status(200)
        .json(new ApiResponse(200, equipment, "Equipment fetched successfully"));
});


export const getEquipmentById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const equipment = await EquipmentModel.getEquipmentById(id);

    if (!equipment) {
        throw new ApiError(404, "Equipment not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, equipment, "Equipment fetched successfully"));
});


export const createEquipment = asyncHandler(async (req, res, next) => {
    const { name, serialNumber, location, assignedTeam } = req.body;

    if (!name || !serialNumber || !location) {
        throw new ApiError(400, "Name, serial number and location are required");
    }

    const existingEquipment = await EquipmentModel.checkSerialNumberExists(serialNumber);
    if (existingEquipment) {
        throw new ApiError(400, "Equipment with this serial number already exists");
    }

    const equipment = await EquipmentModel.createEquipment({
        name,
        serialNumber,
        location,
        assignedTeam: assignedTeam || null,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, equipment, "Equipment created successfully"));
});


export const updateEquipment = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, serialNumber, location, assignedTeam } = req.body;

    const equipment = await EquipmentModel.getEquipmentById(id);

    if (!equipment) {
        throw new ApiError(404, "Equipment not found");
    }

    if (serialNumber && serialNumber !== equipment.serial_number) {
        const existingEquipment = await EquipmentModel.checkSerialNumberExists(serialNumber, id);
        if (existingEquipment) {
            throw new ApiError(400, "Equipment with this serial number already exists");
        }
    }

    const updatedEquipment = await EquipmentModel.updateEquipment(id, {
        name,
        serialNumber,
        location,
        assignedTeam
    });

    return res
        .status(200)
        .json(new ApiResponse(200, updatedEquipment, "Equipment updated successfully"));
});


export const deleteEquipment = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const equipment = await EquipmentModel.getEquipmentById(id);

    if (!equipment) {
        throw new ApiError(404, "Equipment not found");
    }

    await EquipmentModel.deleteEquipment(id);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Equipment deleted successfully"));
});


export const scrapEquipment = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const equipment = await EquipmentModel.getEquipmentById(id);

    if (!equipment) {
        throw new ApiError(404, "Equipment not found");
    }

    if (equipment.status === "SCRAPPED") {
        throw new ApiError(400, "Equipment is already scrapped");
    }

    const scrappedEquipment = await EquipmentModel.scrapEquipment(id);

    return res
        .status(200)
        .json(new ApiResponse(200, scrappedEquipment, "Equipment scrapped successfully"));
});


export const getEquipmentRequests = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const equipment = await EquipmentModel.getEquipmentById(id);

    if (!equipment) {
        throw new ApiError(404, "Equipment not found");
    }

    const requests = await RequestModel.getEquipmentRequests(id);

    const pendingCount = requests.filter(r => r.status === "NEW" || r.status === "IN_PROGRESS").length;

    return res.status(200).json(
        new ApiResponse(200, {
            equipment,
            requests,
            pendingCount,
            totalCount: requests.length,
        }, "Equipment requests fetched successfully")
    );
});