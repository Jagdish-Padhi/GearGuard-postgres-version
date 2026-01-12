import { query, getOne, getMany, insertAndReturn } from "../database/queryHelper.js";

// Get all requests with filters
export const getAllRequests = async (filters = {}) => {
    let text = `
        SELECT r.*, 
               e.name as equipment_name, e.serial_number, e.location,
               mt.name as team_name,
               u.full_name as requested_by_name, u.email as requested_by_email
        FROM requests r
        LEFT JOIN equipment e ON r.equipment_id = e.id
        LEFT JOIN maintenance_teams mt ON r.assigned_team_id = mt.id
        LEFT JOIN users u ON r.requested_by = u.id
    `;

    const params = [];
    const conditions = [];

    if (filters.status) {
        conditions.push(`r.status = $${params.length + 1}`);
        params.push(filters.status);
    }
    if (filters.priority) {
        conditions.push(`r.priority = $${params.length + 1}`);
        params.push(filters.priority);
    }
    if (filters.type) {
        conditions.push(`r.type = $${params.length + 1}`);
        params.push(filters.type);
    }
    if (filters.assignedTeam) {
        conditions.push(`r.assigned_team_id = $${params.length + 1}`);
        params.push(filters.assignedTeam);
    }
    if (filters.equipment) {
        conditions.push(`r.equipment_id = $${params.length + 1}`);
        params.push(filters.equipment);
    }

    if (conditions.length > 0) {
        text += ` WHERE ${conditions.join(" AND ")}`;
    }

    text += ` ORDER BY r.created_at DESC`;
    return getMany(text, params);
};

// Get request by ID
export const getRequestById = async (id) => {
    const text = `
        SELECT r.*, 
               e.name as equipment_name, e.serial_number, e.location,
               mt.id as team_id, mt.name as team_name,
               u.id as requested_by_id, u.full_name as requested_by_name, u.email as requested_by_email
        FROM requests r
        LEFT JOIN equipment e ON r.equipment_id = e.id
        LEFT JOIN maintenance_teams mt ON r.assigned_team_id = mt.id
        LEFT JOIN users u ON r.requested_by = u.id
        WHERE r.id = $1
    `;
    return getOne(text, [id]);
};

// Create request
export const createRequest = async (data) => {
    const { title, description, type, priority, equipment, assignedTeam, requestedBy, scheduledDate } = data;

    const text = `
        INSERT INTO requests (title, description, type, priority, equipment_id, assigned_team_id, requested_by, scheduled_date, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'NEW')
        RETURNING *
    `;

    return insertAndReturn(text, [
        title,
        description,
        type,
        priority || 'MEDIUM',
        equipment,
        assignedTeam || null,
        requestedBy,
        type === 'PREVENTIVE' ? scheduledDate : null
    ]);
};

// Update request
export const updateRequest = async (id, data) => {
    const { title, description, priority, scheduledDate } = data;

    const text = `
        UPDATE requests
        SET 
            title = COALESCE($1, title),
            description = COALESCE($2, description),
            priority = COALESCE($3, priority),
            scheduled_date = COALESCE($4, scheduled_date),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
    `;

    return insertAndReturn(text, [
        title || null,
        description || null,
        priority || null,
        scheduledDate || null,
        id
    ]);
};

// Delete request
export const deleteRequest = async (id) => {
    const text = `DELETE FROM requests WHERE id = $1`;
    return query(text, [id]);
};

// Update request status
export const updateRequestStatus = async (id, status, duration = null) => {
    const text = `
        UPDATE requests
        SET 
            status = $1,
            duration = COALESCE($2, duration),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
    `;

    return insertAndReturn(text, [status, duration || null, id]);
};

// Get requests by status
export const getRequestsByStatus = async () => {
    const text = `
        SELECT r.*, 
               e.name as equipment_name, e.serial_number,
               mt.name as team_name,
               u.full_name as requested_by_name
        FROM requests r
        LEFT JOIN equipment e ON r.equipment_id = e.id
        LEFT JOIN maintenance_teams mt ON r.assigned_team_id = mt.id
        LEFT JOIN users u ON r.requested_by = u.id
        ORDER BY r.status, r.created_at DESC
    `;
    return getMany(text, []);
};

// Get preventive requests for calendar
export const getPreventiveRequests = async (filters = {}) => {
    let text = `
        SELECT r.*, 
               e.name as equipment_name, e.serial_number,
               mt.name as team_name
        FROM requests r
        LEFT JOIN equipment e ON r.equipment_id = e.id
        LEFT JOIN maintenance_teams mt ON r.assigned_team_id = mt.id
        WHERE r.type = 'PREVENTIVE'
    `;

    const params = [];

    if (filters.month && filters.year) {
        const year = parseInt(filters.year);
        const month = parseInt(filters.month);

        text += ` AND EXTRACT(YEAR FROM r.scheduled_date) = $${params.length + 1}`;
        params.push(year);

        text += ` AND EXTRACT(MONTH FROM r.scheduled_date) = $${params.length + 1}`;
        params.push(month);
    }

    text += ` ORDER BY r.scheduled_date ASC`;
    return getMany(text, params);
};

// Get equipment requests
export const getEquipmentRequests = async (equipmentId) => {
    const text = `
        SELECT r.*, 
               mt.name as team_name,
               u.full_name as requested_by_name, u.email as requested_by_email
        FROM requests r
        LEFT JOIN maintenance_teams mt ON r.assigned_team_id = mt.id
        LEFT JOIN users u ON r.requested_by = u.id
        WHERE r.equipment_id = $1
        ORDER BY r.created_at DESC
    `;
    return getMany(text, [equipmentId]);
};