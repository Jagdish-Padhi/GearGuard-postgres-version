-- Users table
CREATE TABLE
    IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(30) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        full_name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'USER' CHECK (role IN ('USER', 'TECHNICIAN', 'MANAGER')),
        refresh_token TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Maintainance Teams table
CREATE TABLE
    IF NOT EXISTS maintenance_teams (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Team technicians junction table 
CREATE TABLE
    IF NOT EXISTS team_technicians (
        team_id INTEGER NOT NULL REFERENCES maintenance_teams (id) ON DELETE CASCADE,
        technician_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        PRIMARY KEY (team_id, technician_id)
    );

-- Equipment table
CREATE TABLE
    IF NOT EXISTS equipment (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        serial_number VARCHAR(255) NOT NULL UNIQUE,
        location VARCHAR(255) NOT NULL UNIQUE,
        assigned_team_id INTEGER REFERENCES maintainance_team (id) ON DELETE CASCADE status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SCRAPPED')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Requests table
CREATE TABLE
    requests (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('CORRECTIVE', 'PREVENTIVE')),
        status VARCHAR(20) DEFAULT 'NEW' CHECK (
            status IN ('NEW', 'IN_PROGRESS', 'REPAIRED', 'SCRAP')
        ),
        priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
        equipment_id INTEGER NOT NULL REFERENCES equipment (id) ON DELETE CASCADE,
        assigned_team_id INTEGER NOT NULL REFERENCES maintenance_teams (id) ON DELETE CASCADE,
        requested_by INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        duration INTEGER,
        scheduled_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Indexes for performance
CREATE INDEX idx_users_email ON users (email);

CREATE INDEX idx_users_username ON users (username);

CREATE INDEX idx_equipment_serial ON equipment (serial_number);

CREATE INDEX idx_requests_equipment ON requests (equipment_id);

CREATE INDEX idx_requests_team ON requests (assigned_team_id);

CREATE INDEX idx_requests_status ON requests (status);