import { query, getOne, getMany, insertAndReturn } from "../database/queryHelper.js";

// Get all equipment with filters
export const getAllEquipment = async (filters = {}) => {
    let text = `SELECT * FROM equipment`;
    const params = [];
    const conditions = [];

    if (filters.status) {
        conditions.push(`status = $${params.length + 1}`);
        params.push(filters.status);
    }

    if (filters.location) {
        conditions.push(`location = $${params.length + 1}`);
        params.push(filters.location);
    }

    if (conditions.length > 0) {
        text += ` WHERE ${conditions.join(" AND ")}`;
    }
}

// Get equipment by ID with team details
export const getEquipmentById = async (id) => {
    const text = `
    SELECT e.*, mt.id as team_id, mt.name as team_name
    FROM equipment e
    LEFT JOIN maintenance_teams mt ON e.assigned_team_id = mt.id
    WHERE e.id = $1`;

    return getOne(text, [id]);
}

// Create Equipment
export const createEquipment = async (data) => {
    const { name, serialNumber, location, assignedTeam } = data;

    const text = `INSERT INTO equipment (name, serial_number, location, assigned_team_id, status)
    VALUES ($1, $2, $3, $4, 'ACTIVE' ) RETURNING *`;

    return insertAndReturn(text, [name, serialNumber, location, assignedTeam || null]);
}

// check if serial number exists
export const checkSerialNumberExists = async (serialNumber, excludedId = null) => {
    let text = `SELECT id FROM equipment WHERE serial_number = $1`;
    const params = [serialNumber];

    if (excludedId) {
        text += ` AND id != $2`;
        params.push(excludedId);
    }
    return getOne(text, params);
}

// Update equipment 
export const updateEquipment = async (id, data) => {
    const {name, serialNumber, location, assignedTeam} = data;

    const text = `UPDATE equipment SET 
    name = COALESCE($1, name),
    serial_number = COALESCE($2, serial_number),
    location = COALESCE($3, location),
    assigned_team_id = COALESCE($4, assigned_team_id),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING *
    `;

    return insertAndReturn(text, [
        name || null,
        serialNumber || null,
        location || null,
        assignedTeam === undefined ? null : assignedTeam,
        id
    ]);
};

// Delete equipment
export const deleteEquipment = async (id) => {
    const text = `DELETE FROM equipment WHERE id = $1`;

    return query(text, [id]);
}

// Mark equipment as scrapped
export const scrapEquipment = async (id) => {
    const text = `UPDATE equipment 
    SET status = 'SCRAPPED', updated_at = CURRENT_TIMESTAMP,
    WHERE id = $1
    RETURNING *`;

    return insertAndReturn(text, [id]);
}