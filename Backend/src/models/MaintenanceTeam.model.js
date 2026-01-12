import { qeury, getOne, getMany, insertAndReturn, query } from '../database/queryHelper.js';

// Get all teams with technicians
export const getAllTeams = async () => {
    const text =
        `SELECT mt.id, mt.name, mt.created_at, mt.updated_at,
    array_agg(
    json_build_object(
    'id', u.id,
    'username', u.username,
    'email', u.email,
    'full_name', u.full_name,
    'role', u.role
    )
    ) FILTER (WHERE u.id IS NOT NULL)
     AS technicians FROM maintenance_teams mt
     LEFT JOIN team_technicians tt ON mt.id = tt.team_id
     LEFT JOIN users u ON tt.technician_id = u.id
     GROUP BY mt.id, mt.name, mt.created_at, mt.updated_at
     ORDER BY mt.created_at DESC
    `;
    return getMany(text, []);
};


// Get team by id with technicians 
export const getTeamById = async (id) => {
    const text = `SELECT mt.id, mt.name, mt.created_at, mt.updated_at,
    array_agg(
    json_build_object(
    'id', u.id,
    'username', u.username,
    'email', u.email,
    'full_name', u.full_name,
    'role', u.role)
    ) FILTER (WHERE u.id IS NOT NULL) as technicians
     FROM maintenance_teams mt
     LEFT JOIN team_technicians tt ON mt.id = tt.team_id
     LEFT JOIN users u ON tt.technician_id = u.id
     WHERE mt.id = $1
     GROUP BY mt.id, mt.name, mt.created_at, mt.updated_at`;

    return getOne(text, [id]);
}


// Create team 
export const createTeam = async (name) => {
    const text = `
    INSERT INTO maintenance_teams (name) VALUES ($1)
    RETURNING id, name, created_at, updated_at
    `;
    return insertAndReturn(text, [name]);
};

// Check if team name exists
export const checkTeamNameExists = async (name, excludeId = null) => {
    let text = `SELECT id FROM maintenance_teams WHERE name = $1`;
    const params = [name];

    if (excludeId) {
        text += ` AND id != $2 `;
        params.push(excludeId);
    }

    return getOne(text, params);
};


// Update team name
export const updateTeam = async (id, name) => {
    const text = ` UPDATE maintenance_teams 
    SET name = $1, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $2 
    RETURNING id, name , created_at, updated_at`;

    return insertAndReturn(text, [name, id]);
};

// Delete team
export const deleteTeam = async(id) => {
    const text = `DELETE FROM maintenance_teams WHERE id = $1`;
    return query(text, [id]);
};

// Add technician to a team
export const addTechnicianToTeam = async(teamId, technicianId) => {
    const text = ` INSERT INTO team_technicians(team_id, technician_id) 
    VALUES ($1, $2) 
    ON CONFLICT DO NOTHING`;

    return query(text, [teamId, technicianId]);
};

// Remove technician from team
export const removeTechnicianFromTeam = async( teamId, technicianId) => {
    const text = `SELECT u.id, u.username, u.email, u.full_name, u.role FROM users u
    JOIN users u
    JOIN team_technicians tt ON u.id = tt.technician_id
    WHERE tt.team_id = $1
    ORDER by u.full_name`;

    return getMany(text, [teamId]);
};
