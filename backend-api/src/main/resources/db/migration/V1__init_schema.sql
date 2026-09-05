-- V1__init_schema.sql
-- Creación inicial del esquema de base de datos para Pitstop

-- 1. Tabla de Usuarios (_user)
CREATE TABLE IF NOT EXISTS _user (
    id CHAR(36) NOT NULL PRIMARY KEY,
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    address VARCHAR(255),
    profile_picture_url VARCHAR(500),
    role VARCHAR(50),
    auth_provider VARCHAR(50) NOT NULL DEFAULT 'LOCAL',
    google_id VARCHAR(255),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_token_expiry DATETIME(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de Talleres (workshops)
CREATE TABLE IF NOT EXISTS workshops (
    id CHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cif VARCHAR(50) NOT NULL UNIQUE,
    address VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    logo_url VARCHAR(500),
    labor_price_per_hour DECIMAL(10, 2) NOT NULL DEFAULT 40.00,
    closing_hour TIME,
    opening_hour TIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Clientes (clients)
CREATE TABLE IF NOT EXISTS clients (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) UNIQUE,
    phone VARCHAR(50),
    vat_number VARCHAR(50),
    CONSTRAINT fk_client_user FOREIGN KEY (user_id) REFERENCES _user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla de Empleados (employees)
CREATE TABLE IF NOT EXISTS employees (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) UNIQUE,
    workshop_id CHAR(36),
    job_position VARCHAR(100),
    allowed_sections VARCHAR(255),
    CONSTRAINT fk_employee_user FOREIGN KEY (user_id) REFERENCES _user(id) ON DELETE CASCADE,
    CONSTRAINT fk_employee_workshop FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabla de Vehículos (vehicles)
CREATE TABLE IF NOT EXISTS vehicles (
    id CHAR(36) NOT NULL PRIMARY KEY,
    client_id CHAR(36) NOT NULL,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT,
    vin VARCHAR(100),
    fuel_type VARCHAR(50),
    mileage INT,
    CONSTRAINT fk_vehicle_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabla de Citas (appointments)
CREATE TABLE IF NOT EXISTS appointments (
    id CHAR(36) NOT NULL PRIMARY KEY,
    workshop_id CHAR(36) NOT NULL,
    client_id CHAR(36) NOT NULL,
    vehicle_id CHAR(36) NOT NULL,
    appointment_date DATETIME(6) NOT NULL,
    end_date DATETIME(6),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    reason VARCHAR(500),
    notes TEXT,
    initial_photo_url VARCHAR(500),
    initial_notes TEXT,
    check_in_time DATETIME(6),
    estimated_hours DECIMAL(5,2),
    assigned_mechanic_id CHAR(36),
    lane_index INT DEFAULT 0,
    locked_by_client BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_appointment_workshop FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE CASCADE,
    CONSTRAINT fk_appointment_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    CONSTRAINT fk_appointment_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    CONSTRAINT fk_appointment_mechanic FOREIGN KEY (assigned_mechanic_id) REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Categorías de Tareas de Catálogo (task_categories)
CREATE TABLE IF NOT EXISTS task_categories (
    id CHAR(36) NOT NULL PRIMARY KEY,
    workshop_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT fk_task_category_workshop FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Tareas de Catálogo (catalog_tasks)
CREATE TABLE IF NOT EXISTS catalog_tasks (
    id CHAR(36) NOT NULL PRIMARY KEY,
    category_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    estimated_hours DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    CONSTRAINT fk_catalog_task_category FOREIGN KEY (category_id) REFERENCES task_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Tareas de Taller Asignadas a Citas (workshop_tasks)
CREATE TABLE IF NOT EXISTS workshop_tasks (
    id CHAR(36) NOT NULL PRIMARY KEY,
    appointment_id CHAR(36) NOT NULL,
    catalog_task_id CHAR(36),
    name VARCHAR(255) NOT NULL,
    estimated_hours DECIMAL(5,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    delayed_reason VARCHAR(255),
    CONSTRAINT fk_workshop_task_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    CONSTRAINT fk_workshop_task_catalog FOREIGN KEY (catalog_task_id) REFERENCES catalog_tasks(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Categorías de Piezas (part_categories)
CREATE TABLE IF NOT EXISTS part_categories (
    id CHAR(36) NOT NULL PRIMARY KEY,
    workshop_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT fk_part_category_workshop FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Catálogo de Piezas (part_catalog)
CREATE TABLE IF NOT EXISTS part_catalog (
    id CHAR(36) NOT NULL PRIMARY KEY,
    category_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    reference VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_part_catalog_category FOREIGN KEY (category_id) REFERENCES part_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Inventario de Taller (workshop_inventory)
CREATE TABLE IF NOT EXISTS workshop_inventory (
    id CHAR(36) NOT NULL PRIMARY KEY,
    workshop_id CHAR(36) NOT NULL,
    part_catalog_id CHAR(36) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_inventory_workshop FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE CASCADE,
    CONSTRAINT fk_inventory_part FOREIGN KEY (part_catalog_id) REFERENCES part_catalog(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Piezas Asignadas a Citas (appointment_parts)
CREATE TABLE IF NOT EXISTS appointment_parts (
    id CHAR(36) NOT NULL PRIMARY KEY,
    appointment_id CHAR(36) NOT NULL,
    part_catalog_id CHAR(36) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_appointment_parts_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    CONSTRAINT fk_appointment_parts_part FOREIGN KEY (part_catalog_id) REFERENCES part_catalog(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Facturas (invoices)
CREATE TABLE IF NOT EXISTS invoices (
    id CHAR(36) NOT NULL PRIMARY KEY,
    appointment_id CHAR(36) NOT NULL UNIQUE,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    issue_date DATETIME(6) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) NOT NULL,
    labor_cost DECIMAL(10, 2) NOT NULL,
    parts_cost DECIMAL(10, 2) NOT NULL,
    pdf_url VARCHAR(500),
    CONSTRAINT fk_invoice_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
