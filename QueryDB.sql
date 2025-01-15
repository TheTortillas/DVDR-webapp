# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ CREACIÓN E INICIALIZACIÓN DE LA BASE DE DATOS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
CREATE DATABASE dvdr_cursos;
USE dvdr_cursos;

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ TABLAS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
CREATE TABLE centers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('CITTA', 'CVDR', 'UA') NOT NULL,
    identifier INT NOT NULL,
    UNIQUE KEY (type, identifier) -- Índice compuesto
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    second_last_name VARCHAR(100),
    center_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (center_id) REFERENCES centers(id)
);

CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_name VARCHAR(255),
    service_type VARCHAR(255),
    category VARCHAR(255),
    agreement VARCHAR(255),
    total_duration INT,
    modality VARCHAR(255),
    educational_offer VARCHAR(255),
    educational_platform VARCHAR(255),
    course_key VARCHAR(50),
    status ENUM('draft', 'submitted') DEFAULT 'draft' NOT NULL,
    approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' NOT NULL,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE,
    
    UNIQUE (course_key, status)
);

CREATE TABLE documents_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    filePath VARCHAR(255) NOT NULL
);

CREATE TABLE course_documentation (
	id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL, -- Relación con cursos
    document_id INT NOT NULL, -- Relación con plantillas de documentos
    filePath VARCHAR(255) NOT NULL, -- Ruta al documento cargado o personalizado
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents_templates(id) ON DELETE CASCADE
);

CREATE TABLE actors_general_information (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    second_last_name VARCHAR(255) NOT NULL,
    street VARCHAR(255) NOT NULL,
    house_number VARCHAR(255) NOT NULL,
    neighborhood VARCHAR(255) NOT NULL,
    postal_code VARCHAR(5) NOT NULL,
    municipality VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    landline_phone VARCHAR(15) NOT NULL,
    mobile_phone VARCHAR(15) NOT NULL,
    knowledge_area VARCHAR(15) NOT NULL,
    center_type ENUM('CITTA', 'CVDR', 'UA') NOT NULL, -- Relación con el tipo de centro
    center_identifier INT NOT NULL, -- Relación con el identificador
    FOREIGN KEY (center_type, center_identifier) REFERENCES centers(type, identifier)
);

-- Tabla de historial académico, relacionada con el instructor
CREATE TABLE academic_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    actor_id INT NOT NULL, -- Relación con el actor
    education_level VARCHAR(255) NOT NULL,
    period VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    degree_awarded VARCHAR(255) NOT NULL,
    evidence BLOB NOT NULL,
    FOREIGN KEY (actor_id) REFERENCES actors_general_information(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Tabla de experiencia profesional, relacionada con el instructor
CREATE TABLE professional_experience (
    id INT PRIMARY KEY AUTO_INCREMENT,
    actor_id INT NOT NULL, -- Relación con el instructor
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    organization VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    activity TEXT NOT NULL,
    evidence BLOB NOT NULL,
    FOREIGN KEY (actor_id) REFERENCES actors_general_information(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Tabla intermedia para relacionar cursos con actores y sus roles
CREATE TABLE course_actor_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL, -- Relación con la tabla de cursos
    actor_id INT NOT NULL, -- Relación con la tabla de actores
    role VARCHAR(50) NOT NULL, -- Rol del actor en el curso

    FOREIGN KEY (course_id) REFERENCES courses(id) 
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES actors_general_information(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Tabla para registrar las veces que se ha impartido cada curso
CREATE TABLE course_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL, -- Relación con la tabla de cursos
    period VARCHAR(255) NOT NULL, -- Periodo en el que se impartió el curso (Ene2024-Mar2024)
    number_of_participants INT NOT NULL, -- Número de personas que tomaron el curso
    number_of_certificates INT NOT NULL, -- Constancias entregadas
    status VARCHAR(255) NOT NULL, -- Estatus del curso (Aperturado, Concluido, En espera)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (course_id) REFERENCES courses(id) 
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Tabla para registrar el cronograma de cada sesión de un curso
CREATE TABLE course_schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL, -- Relación con la tabla de sesiones del curso
    date DATE NOT NULL, -- Fecha específica
    start_time TIME NOT NULL, -- Hora de inicio en esa fecha
    end_time TIME NOT NULL, -- Hora de fin en esa fecha

    FOREIGN KEY (session_id) REFERENCES course_sessions(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE academic_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ PROCEDMIENTOS ALMACENADOS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Procedimiento para dar de alta un usuario
DELIMITER $$
CREATE PROCEDURE sp_insert_user(
    IN p_username VARCHAR(255),
    IN p_password VARCHAR(255),
    IN p_first_name VARCHAR(100),
    IN p_last_name VARCHAR(100),
    IN p_second_last_name VARCHAR(100),
    IN p_center VARCHAR(255)
)
BEGIN
    DECLARE hashed_password VARCHAR(255);
    DECLARE v_center_id INT;

    -- Manejo de errores
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        SELECT -1 AS status_code, 'Error: No se pudo insertar el usuario. Verifique los datos.' AS mensaje;
    END;

    DECLARE EXIT HANDLER FOR SQLWARNING 
    BEGIN
        ROLLBACK;
        SELECT -1 AS status_code, 'Advertencia: Hubo un problema en la base de datos.' AS mensaje;
    END;

    START TRANSACTION;

    -- Obtener el id del centro a partir del nombre
    SELECT id INTO v_center_id 
    FROM centers 
    WHERE name = p_center 
    LIMIT 1;

    -- Verificar que el centro exista
    IF v_center_id IS NULL THEN
        SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Error: El centro especificado no existe.';
    END IF;

    -- Hash de la contraseña
    SET hashed_password = SHA2(p_password, 256);

    -- Insertar el nuevo usuario
    INSERT INTO users (username, password, first_name, last_name, second_last_name, center_id)
    VALUES (p_username, hashed_password, p_first_name, p_last_name, p_second_last_name, v_center_id);

    COMMIT;

    -- Confirmación de éxito
    SELECT 1 AS status_code, 'Éxito: Usuario insertado correctamente.' AS mensaje;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_verify_user(
    IN p_username VARCHAR(50),
    IN p_password VARCHAR(255),
    OUT p_is_valid BOOLEAN,
    OUT p_user_center VARCHAR(100)
)
BEGIN
    DECLARE stored_password VARCHAR(255);
    DECLARE user_center VARCHAR(100);

    -- Manejo de errores
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_is_valid = FALSE;
        SET p_user_center = NULL;
    END;

    START TRANSACTION;

    -- Obtener la contraseña almacenada, el nombre del centro y el identificador del centro
    SELECT u.password, c.name
    INTO stored_password, user_center
    FROM users u
    INNER JOIN centers c ON u.center_id = c.id
    WHERE u.username = p_username
    LIMIT 1;

    -- Verificar si el usuario existe y validar la contraseña
    IF stored_password IS NULL THEN
        SET p_is_valid = FALSE;
        SET p_user_center = NULL;
    ELSE
        IF SHA2(p_password, 256) = stored_password THEN
            SET p_is_valid = TRUE;
            SET p_user_center = user_center;
        ELSE
            SET p_is_valid = FALSE;
            SET p_user_center = NULL;
        END IF;
    END IF;

    COMMIT;
END$$
DELIMITER ;

-- Procedimiento para verificar si ya eciste el username
DELIMITER $$
CREATE PROCEDURE sp_check_username(
    IN p_username VARCHAR(50),   
    OUT p_exists BOOLEAN         
)
BEGIN
    DECLARE user_count INT;    
    
    -- Manejo de errores
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        SET p_exists = NULL;     
        SELECT -1 AS status_code, 'Error: No se pudo verificar el nombre de usuario.' AS mensaje;
    END;

    DECLARE EXIT HANDLER FOR SQLWARNING 
    BEGIN
        ROLLBACK;
        SET p_exists = NULL;    
        SELECT -1 AS status_code, 'Advertencia: Hubo un problema en la base de datos.' AS mensaje;
    END;

    START TRANSACTION;
		SELECT COUNT(*) INTO user_count
		FROM users
		WHERE username = p_username;

		IF user_count > 0 THEN
			SET p_exists = TRUE;     
		ELSE
			SET p_exists = FALSE;    
		END IF;
    COMMIT;
END$$
DELIMITER ;

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ LLENADO DE TABLAS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
INSERT INTO academic_categories (name) VALUES
('Ingeniería y Ciencias Físico-Matemáticas'),
('Ciencias Médico Biológicas'),
('Ciencias Sociales y Administrativas'),
('Desarrollo Humano'),
('Idiomas'),
('Multidisciplinarios'),
('Educación'),
('TIC');

INSERT INTO centers (name, type, identifier) VALUES
('Centro de Innovación e Integración de Tecnologías Avanzadas Chihuahua', 'CITTA', 2),
('Centro de Innovación e Integración de Tecnologías Avanzadas Puebla', 'CITTA', 3),
('Centro de Innovación e Integración de Tecnologías Avanzadas Veracruz', 'CITTA', 1),
('Centro de Vinculación y Desarrollo Regional Unidad Cajeme', 'CVDR', 1),
('Centro de Vinculación y Desarrollo Regional Unidad Campeche', 'CVDR', 2),
('Centro de Vinculación y Desarrollo Regional Unidad Cancún', 'CVDR', 3),
('Centro de Vinculación y Desarrollo Regional Culiacán', 'CVDR', 4),
('Centro de Vinculación y Desarrollo Regional Durango', 'CVDR', 5),
('Centro de Vinculación y Desarrollo Regional Unidad Los Mochis', 'CVDR', 6),
('Centro de Desarrollo y Vinculación Regional Unidad Mazatlán', 'CVDR', 7),
('Centro de Vinculación y Desarrollo Regional Unidad Morelia', 'CVDR', 8),
('Centro de Vinculación y Desarrollo Regional Unidad Tlaxcala', 'CVDR', 12),
('Centro de Vinculación y Desarrollo Regional Unidad Oaxaca', 'CVDR', 9),
('Centro de Vinculación y Desarrollo Regional Unidad Tijuana', 'CVDR', 11),
('Centro de Vinculación y Desarrollo Regional Unidad Tampico', 'CVDR', 10);

INSERT INTO documents_templates (name, filePath) VALUES
('Formato de registro de cursos de formación a lo largo de la vida', 'assets/templates/01 FS20H 2024-2.docx'),
('Lista de cotejo para formato de registro de cursos', 'assets/templates/01 LC20H 2024-2.xlsx'),
('Lista de cotejo para cursos en modalidad no escolarizada', 'assets/templates/01 LC20H 2024-2.xlsx'),
('Formato de protesta de autoría', 'assets/templates/02 FPA20H 2024.docx'),
('Cronograma de actividades', 'assets/templates/03 CR20H 2024 .docx'),
('Formato de curriculum vitae', 'assets/templates/04 CV20H 2024.docx'),
('Carta aval', 'assets/templates/05 CA-ejemplo.pdf');

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ PRUEBAS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Ejemplo de cómo insertar un nuevo usuario con los nuevos campos
CALL sp_insert_user('admin', 'admin', 'Sebastián', 'Morales', 'Palacios', 'Centro de Innovación e Integración de Tecnologías Avanzadas Veracruz');
-- Llamar al procedimiento para verificar usuario y contraseña
 CALL sp_verify_user('admin', 'admin', @is_valid, @user_center);
 -- SELECT @is_valid;

-- CALL sp_check_username('admin', @user_exists);
-- SELECT @user_exists;

SELECT * FROM users;
/*
SELECT 
    u.id AS user_id,
    u.username,
    u.first_name,
    u.last_name,
    u.second_last_name,
    u.created_at AS user_created_at,
    c.id AS center_id,
    c.name AS center_name,
    c.type AS center_type,
FROM 
    users u
INNER JOIN 
    centers c
ON 
    u.center_id = c.id;
*/

  -- DROP DATABASE dvdr_cursos;

