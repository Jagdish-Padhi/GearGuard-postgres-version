import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import * as TeamModel from "../models/MaintenanceTeam.model.js";
import * as UserModel from "../models/user.model.js";


export const getAllTeams = asyncHandler(async (req, res, next) => {
    const teams = await TeamModel.getAllTeams();

    return res
        .status(200)
        .json(new ApiResponse(200, teams, "Teams fetched successfully"));
});


export const getTeamById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const team = await TeamModel.getTeamById(id);

    if (!team) {
        throw new ApiError(404, "Team not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, team, "Team fetched successfully"));
});


export const createTeam = asyncHandler(async (req, res, next) => {
    const { name, technicians } = req.body;

    if (!name) {
        throw new ApiError(400, "Team name is required");
    }

    const existingTeam = await TeamModel.checkTeamNameExists(name);
    if (existingTeam) {
        throw new ApiError(400, "Team with this name already exists");
    }

    const team = await TeamModel.createTeam(name);

    if (technicians && technicians.length > 0) {
        for (const technicianId of technicians) {
            await TeamModel.addTechnicianToTeam(team.id, technicianId);
        }
    }

    const populatedTeam = await TeamModel.getTeamById(team.id);

    return res
        .status(201)
        .json(new ApiResponse(201, populatedTeam, "Team created successfully"));
});


export const updateTeam = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;

    const team = await TeamModel.getTeamById(id);

    if (!team) {
        throw new ApiError(404, "Team not found");
    }

    if (name && name !== team.name) {
        const existingTeam = await TeamModel.checkTeamNameExists(name, id);
        if (existingTeam) {
            throw new ApiError(400, "Team with this name already exists");
        }
    }

    if (name) {
        await TeamModel.updateTeam(id, name);
    }

    const updatedTeam = await TeamModel.getTeamById(id);

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTeam, "Team updated successfully"));
});


export const deleteTeam = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const team = await TeamModel.getTeamById(id);

    if (!team) {
        throw new ApiError(404, "Team not found");
    }

    await TeamModel.deleteTeam(id);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Team deleted successfully"));
});


export const addTechnician = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { technicianId } = req.body;

    if (!id || !technicianId) {
        throw new ApiError(400, "Team ID and Technician ID are required");
    }

    const team = await TeamModel.getTeamById(id);
    if (!team) {
        throw new ApiError(404, "Team not found");
    }

    const technician = await UserModel.findUserById(technicianId);
    if (!technician || technician.role !== "TECHNICIAN") {
        throw new ApiError(404, "Technician not found");
    }

    await TeamModel.addTechnicianToTeam(id, technicianId);

    const updatedTeam = await TeamModel.getTeamById(id);

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTeam, "Technician added to team successfully"));
});


export const removeTechnician = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { technicianId } = req.body;

    if (!id || !technicianId) {
        throw new ApiError(400, "Team ID and Technician ID are required");
    }

    const team = await TeamModel.getTeamById(id);
    if (!team) {
        throw new ApiError(404, "Team not found");
    }

    await TeamModel.removeTechnicianFromTeam(id, technicianId);

    const updatedTeam = await TeamModel.getTeamById(id);

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTeam, "Technician removed from team successfully"));
});