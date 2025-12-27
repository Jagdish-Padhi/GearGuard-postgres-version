import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Equipment } from "../models/equipment.model.js";
import { Request } from "../models/request.model.js";


export const getAllEquipment = asyncHandler(async (req, res, next) => {
    const filter = {};

    if (req.query.status) {
        filter.status = req.query.status;
    }
    if (req.query.location) {
        filter.location = req.query.location;
    }

    const equipment = await Equipment.find(filter)
        .populate("assignedTeam", "name")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, equipment, "Equipment fetched successfully"));
});


export const getEquipmentById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const equipment = await Equipment.findById(id)
        .populate("assignedTeam", "name technicians");

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

    // if serial number already exists
    const existingEquipment = await Equipment.findOne({ serialNumber });
    if (existingEquipment) {
        throw new ApiError(400, "Equipment with this serial number already exists");
    }

    const equipment = await Equipment.create({
        name,
        serialNumber,
        location,
        assignedTeam: assignedTeam || null,
    });

    const populatedEquipment = await Equipment.findById(equipment._id)
        .populate("assignedTeam", "name");

    return res
        .status(201)
        .json(new ApiResponse(201, populatedEquipment, "Equipment created successfully"));
});


export const updateEquipment = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, serialNumber, location, assignedTeam } = req.body;

    const equipment = await Equipment.findById(id);

    if (!equipment) {
        throw new ApiError(404, "Equipment not found");
    }

    //  serial number uniqueness if updating
    if (serialNumber && serialNumber !== equipment.serialNumber) {
        const existingEquipment = await Equipment.findOne({ serialNumber });
        if (existingEquipment) {
            throw new ApiError(400, "Equipment with this serial number already exists");
        }
    }

    if (name) equipment.name = name;
    if (serialNumber) equipment.serialNumber = serialNumber;
    if (location) equipment.location = location;
    if (assignedTeam !== undefined) equipment.assignedTeam = assignedTeam;

    await equipment.save();

    const updatedEquipment = await Equipment.findById(id)
        .populate("assignedTeam", "name");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedEquipment, "Equipment updated successfully"));
});


export const deleteEquipment = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const equipment = await Equipment.findById(id);

    if (!equipment) {
        throw new ApiError(404, "Equipment not found");
    }

    await Equipment.findByIdAndDelete(id);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Equipment deleted successfully"));
});


export const scrapEquipment = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const equipment = await Equipment.findById(id);

    if (!equipment) {
        throw new ApiError(404, "Equipment not found");
    }

    if (equipment.status === "SCRAPPED") {
        throw new ApiError(400, "Equipment is already scrapped");
    }

    equipment.status = "SCRAPPED";
    await equipment.save();

    return res
        .status(200)
        .json(new ApiResponse(200, equipment, "Equipment scrapped successfully"));
});


export const getEquipmentRequests = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const equipment = await Equipment.findById(id);

    if (!equipment) {
        throw new ApiError(404, "Equipment not found");
    }

    const requests = await Request.find({ equipment: id })
        .populate("assignedTeam", "name")
        .populate("requestedBy", "fullName email")
        .sort({ createdAt: -1 });

    // pending/open requests
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