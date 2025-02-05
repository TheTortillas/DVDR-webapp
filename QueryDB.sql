# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ CREACIÓN E INICIALIZACIÓN DE LA BASE DE DATOS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
CREATE DATABASE dvdr_cursos;
USE dvdr_cursos;

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ TABLAS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
CREATE TABLE centers (
   id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('CITTA', 'CVDR', 'UA') NOT NULL,
    identifier INT NOT NULL,
    UNIQUE KEY (type, identifier)
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
   other_educationals_platforms VARCHAR(255),
   course_key VARCHAR(50),
   status ENUM('draft', 'submitted') DEFAULT 'submitted' NOT NULL,
   approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' NOT NULL,
   admin_notes TEXT,
   is_renewed TINYINT(1) NOT NULL DEFAULT 0,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   
   -- CAMPOS para manejar vigencia y renovaciones
   expiration_date DATE NOT NULL,         -- Fecha de vencimiento
   renewal_count INT DEFAULT 0,           -- Cuántas veces ha sido renovado (si es el original = 0)
   parent_course_id INT NULL,             -- FK al curso original (o al padre de la última renovación) NULL si es el original

   user_id INT NOT NULL,
   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

   -- Relación para la “herencia” entre curso original y renovaciones
   FOREIGN KEY (parent_course_id) REFERENCES courses(id) ON DELETE CASCADE,

   UNIQUE (course_key, status)
);

CREATE TABLE documents_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    filePath VARCHAR(2083) NOT NULL, -- Ampliado para soportar URLs largas
    type ENUM('file', 'url') DEFAULT 'file' NOT NULL -- O es URL o es archivo
);

CREATE TABLE certificate_documents_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    filePath VARCHAR(2083),
    type ENUM('file', 'url') DEFAULT 'file',
    required BOOLEAN DEFAULT true
);

CREATE TABLE document_access (
    id INT PRIMARY KEY AUTO_INCREMENT,
    document_id INT NOT NULL, -- Relación con documents_templates
    modality ENUM('schooled', 'non-schooled', 'mixed') NOT NULL, -- Modalidad asociada al documento
    required TINYINT(1) NOT NULL DEFAULT 0, -- 1 si es obligatorio, 0 si no lo es
    FOREIGN KEY (document_id) REFERENCES documents_templates(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
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
    house_number VARCHAR(20) NOT NULL,
    neighborhood VARCHAR(255) NOT NULL,
    postal_code VARCHAR(5) NOT NULL,
    municipality VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    landline_phone VARCHAR(15) NOT NULL,
    mobile_phone VARCHAR(15) NOT NULL,
    knowledge_area VARCHAR(255) NOT NULL,
	center_type ENUM('CITTA', 'CVDR', 'UA') NOT NULL, -- Incluye el tipo de centro
    center_identifier INT NOT NULL, -- Referencia al identificador único del centro
    approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    evidence_path VARCHAR(255) NOT NULL,
    FOREIGN KEY (actor_id) REFERENCES actors_general_information(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Tabla de experiencia profesional, relacionada con el instructor
CREATE TABLE professional_experience (
    id INT PRIMARY KEY AUTO_INCREMENT,
    actor_id INT NOT NULL, -- Relación con el instructor
    period VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    activity TEXT NOT NULL,
    evidence_path VARCHAR(255) NOT NULL,
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
    status ENUM('pending', 'opened', 'completed') NOT NULL DEFAULT 'pending', -- Estatus del curso (Aperturado, Concluido, En espera)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (course_id) REFERENCES courses(id) 
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Tabla para registrar el cronograma de cada sesión de un curso
CREATE TABLE course_schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL, 	-- Relación con la tabla de sesiones del curso
    date DATE NOT NULL, 		-- Fecha específica
    start_time TIME NOT NULL, 	-- Hora de inicio en esa fecha
    end_time TIME NOT NULL, 	-- Hora de fin en esa fecha

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

-- Procedimiento para verificar si un usuario corresponde con su contraseña
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

-- Procedimiento para verificar si ya existe el username
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

-- Procedimiento para dar de alta un instructor: Datos generales, historial académico e información laboral
DELIMITER $$
CREATE PROCEDURE sp_register_instructor_all(
    IN p_first_name VARCHAR(255),
    IN p_last_name VARCHAR(255),
    IN p_second_last_name VARCHAR(255),
    IN p_street VARCHAR(255),
    IN p_house_number VARCHAR(20),
    IN p_neighborhood VARCHAR(255),
    IN p_postal_code VARCHAR(5),
    IN p_municipality VARCHAR(255),
    IN p_state VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_landline_phone VARCHAR(15),
    IN p_mobile_phone VARCHAR(15),
    IN p_knowledge_area VARCHAR(255),
    IN p_center_name VARCHAR(255),

    -- Parámetros JSON para historial académico y experiencia
    IN p_academic_history JSON,
    IN p_professional_experience JSON,

    OUT p_status_code INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_center_id INT;
    DECLARE v_actor_id INT;

    -- Manejo de errores
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        SET p_status_code = -1;
        SET p_message = 'Error: No se pudo registrar todo el proceso.';
    END;

    START TRANSACTION;

    -- Buscar el ID del centro a partir del nombre
    SELECT id 
    INTO v_center_id
    FROM centers
    WHERE name = p_center_name
    LIMIT 1;

    IF v_center_id IS NULL THEN
        ROLLBACK;
        SET p_status_code = -2;
        SET p_message = 'Error: El centro especificado no existe.';
    END IF;

    -- Insertar en actors_general_information
    INSERT INTO actors_general_information (
      first_name,
      last_name,
      second_last_name,
      street,
      house_number,
      neighborhood,
      postal_code,
      municipality,
      state,
      email,
      landline_phone,
      mobile_phone,
      knowledge_area,
      center_type,
      center_identifier
    )
    VALUES (
      p_first_name,
      p_last_name,
      p_second_last_name,
      p_street,
      p_house_number,
      p_neighborhood,
      p_postal_code,
      p_municipality,
      p_state,
      p_email,
      p_landline_phone,
      p_mobile_phone,
      p_knowledge_area,
      (SELECT type FROM centers WHERE id = v_center_id),
      (SELECT identifier FROM centers WHERE id = v_center_id)
    );

    SET v_actor_id = LAST_INSERT_ID();

    -- Insertar historial académico usando JSON_TABLE (MySQL 8+)
	INSERT INTO academic_history (
	  actor_id,
	  education_level,
	  period,
	  institution,
	  degree_awarded,
	  evidence_path
	)
	SELECT
	  v_actor_id,
	  t.education_level,
	  t.period,
	  t.institution,
	  t.degree_awarded,
	  t.evidence_path -- El backend ya envió este campo con la ruta generada
	FROM
	  JSON_TABLE(
		p_academic_history,
		'$[*]' 
		COLUMNS (
		  education_level VARCHAR(255) PATH '$.education_level',
		  period VARCHAR(255) PATH '$.period',
		  institution VARCHAR(255) PATH '$.institution',
		  degree_awarded VARCHAR(255) PATH '$.degree_awarded',
		  evidence_path VARCHAR(255) PATH '$.evidence_path'
		)
	  ) AS t;

	-- Insertar experiencia profesional usando JSON_TABLE
	INSERT INTO professional_experience (
	  actor_id,
	  period,
	  organization,
	  position,
	  activity,
	  evidence_path
	)
	SELECT
	  v_actor_id,
	  t.period,
	  t.organization,
	  t.position,
	  t.activity,
	  t.evidence_path -- El backend ya envió este campo con la ruta generada
	FROM
	  JSON_TABLE(
		p_professional_experience,
		'$[*]'
		COLUMNS (
		  period VARCHAR(255) PATH '$.period',
		  organization VARCHAR(255) PATH '$.organization',
		  position VARCHAR(255) PATH '$.position',
		  activity TEXT PATH '$.activity',
		  evidence_path VARCHAR(255) PATH '$.evidence_path'
		)
	  ) AS t;

    -- Confirmar transacción
    COMMIT;

    SET p_status_code = 1;
    SET p_message = 'Instructor, historial académico y experiencia registrados exitosamente.';
END$$
DELIMITER ;

-- Procedimiento para registrar un nuevo curso (original o no)
DELIMITER $$
CREATE PROCEDURE sp_register_course(
    IN p_course_name VARCHAR(255),
    IN p_service_type VARCHAR(255),
    IN p_category VARCHAR(255),
    IN p_agreement VARCHAR(255),
    IN p_total_duration INT,
    IN p_modality VARCHAR(255),
    IN p_educational_offer VARCHAR(255),
    IN p_educational_platform VARCHAR(255),
    IN p_other_educationals_platforms VARCHAR(255),
    IN p_course_key VARCHAR(50),
    IN p_username VARCHAR(50),

    IN p_expiration_date DATE,
    IN p_renewal_count INT,
    IN p_parent_course_id INT,  -- Si es 0 o NULL, se asume que es curso original

    IN p_documentation JSON,
    IN p_actor_roles JSON,

    OUT p_status_code INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_user_id INT;
    DECLARE v_course_id INT;

    -- Manejo de errores
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_code = -1;
        SET p_message = 'Error: No se pudo registrar el curso (o renovación).';
    END;

    START TRANSACTION;

    -- Obtener el ID del usuario a partir del username
    SELECT id
    INTO v_user_id
    FROM users
    WHERE username = p_username
    LIMIT 1;

    IF v_user_id IS NULL THEN
        ROLLBACK;
        SET p_status_code = -2;
        SET p_message = 'Error: Usuario no encontrado.';
    END IF;

    -- Insertar en la tabla de cursos
    INSERT INTO courses (
        course_name,
        service_type,
        category,
        agreement,
        total_duration,
        modality,
        educational_offer,
        educational_platform,
        other_educationals_platforms,
        course_key,
        user_id,
        expiration_date,
        renewal_count,
        parent_course_id
    )
    VALUES (
        p_course_name,
        p_service_type,
        p_category,
        p_agreement,
        p_total_duration,
        p_modality,
        p_educational_offer,
        p_educational_platform,
        p_other_educationals_platforms,
        p_course_key,
        v_user_id,
        p_expiration_date,
        p_renewal_count,
        CASE WHEN p_parent_course_id = 0 THEN NULL ELSE p_parent_course_id END
    );

    SET v_course_id = LAST_INSERT_ID();

    -- Actualizar el campo isRenewed del curso padre si es una renovación
    IF p_parent_course_id IS NOT NULL AND p_parent_course_id <> 0 THEN
        UPDATE courses
        SET is_renewed = 1
        WHERE id = p_parent_course_id;
    END IF;

    -- Insertar documentación relacionada con el curso usando JSON_TABLE
    INSERT INTO course_documentation (
        course_id,
        document_id,
        filePath
    )
    SELECT
        v_course_id,
        d.document_id,
        d.filePath
    FROM
        JSON_TABLE(
            p_documentation,
            '$[*]'
            COLUMNS (
                document_id INT PATH '$.DocumentID',
                filePath VARCHAR(255) PATH '$.FilePath'
            )
        ) AS d;

    -- Insertar roles de actores asociados al curso usando JSON_TABLE
    INSERT INTO course_actor_roles (
        course_id,
        actor_id,
        role
    )
    SELECT
        v_course_id,
        t.actor_id,
        t.role
    FROM
        JSON_TABLE(
            p_actor_roles,
            '$[*]'
            COLUMNS (
                actor_id INT PATH '$.actor_id',
                role VARCHAR(50) PATH '$.role'
            )
        ) AS t;

    COMMIT;

    SET p_status_code = 1;
    SET p_message = 'Curso (o renovación) registrado exitosamente.';
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_get_course_by_id(IN p_course_id INT)
BEGIN
    -- Seleccionar datos generales del curso
    SELECT 
        c.id AS course_id,
        c.course_key,
        c.course_name,
        c.service_type,
        c.category,
        c.agreement,
        c.total_duration,
        c.modality,
        c.educational_offer,
        c.educational_platform,
        c.other_educationals_platforms,
        c.expiration_date,
        c.renewal_count,
        c.parent_course_id,
        u.username AS created_by
    FROM courses c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = p_course_id;

    -- Seleccionar actores y roles asociados al curso
    SELECT 
        a.id AS actor_id,
        CONCAT(a.first_name, ' ', a.last_name, ' ', a.second_last_name) AS actor_name,
        car.role
    FROM course_actor_roles car
    JOIN actors_general_information a ON car.actor_id = a.id
    WHERE car.course_id = p_course_id;

    -- Seleccionar documentación del curso
    SELECT 
        d.id AS document_id,
        d.name AS document_name,
        cd.filePath
    FROM course_documentation cd
    JOIN documents_templates d ON cd.document_id = d.id
    WHERE cd.course_id = p_course_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_register_course_session(
    IN p_course_id INT,
    IN p_period VARCHAR(255),
    IN p_number_of_participants INT,
    IN p_number_of_certificates INT,
    IN p_schedule_json JSON,
    OUT p_status_code INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_session_id INT;

    -- Manejo de errores con transacción
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        SET p_status_code = -1;
        SET p_message = 'Error: No se pudo registrar la sesión del curso.';
    END;

    START TRANSACTION;

    --  Insertar sesión del curso (status = 'pending' por defecto)
    INSERT INTO course_sessions (course_id, period, number_of_participants, number_of_certificates)
    VALUES (p_course_id, p_period, p_number_of_participants, p_number_of_certificates);

    -- Obtener el ID de la sesión recién insertada
    SET v_session_id = LAST_INSERT_ID();

    --  Insertar cronograma usando JSON_TABLE
    INSERT INTO course_schedules (session_id, date, start_time, end_time)
    SELECT v_session_id, t.date, t.start_time, t.end_time
    FROM JSON_TABLE(
        p_schedule_json,
        '$[*]'
        COLUMNS (
            date DATE PATH '$.date',
            start_time TIME PATH '$.start_time',
            end_time TIME PATH '$.end_time'
        )
    ) AS t;

    COMMIT;

    --  Confirmación de éxito
    SET p_status_code = 1;
    SET p_message = 'Sesión de curso y cronograma guardados exitosamente.';
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_get_courses_with_sessions(
    IN p_username VARCHAR(50)
)
BEGIN
    DECLARE v_user_id INT;

    -- Obtener el ID del usuario
    SELECT id INTO v_user_id FROM users WHERE username = p_username LIMIT 1;

    IF v_user_id IS NULL THEN
        SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Error: Usuario no encontrado.';
    END IF;

    -- Obtener todos los cursos (incluyendo renovaciones) del usuario
    SELECT 
        c.id AS course_id,
        c.course_name AS title,
        c.course_key AS clave,
        c.renewal_count,
        c.expiration_date
    FROM courses c
    WHERE c.user_id = v_user_id
    ORDER BY c.course_name, c.renewal_count;

    -- Obtener las sesiones de cada curso y sus renovaciones
    SELECT 
        cs.id AS session_id,  -- Ahora devolvemos el ID de la sesión
        c.course_key AS clave,  -- Clave del curso
        cs.period AS periodo,
        cs.number_of_participants AS participantes,
        cs.number_of_certificates AS constancias,
        cs.status AS estatus
    FROM course_sessions cs
    JOIN courses c ON cs.course_id = c.id
    WHERE c.user_id = v_user_id
    ORDER BY c.course_name, cs.period;
    
END $$
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

INSERT INTO documents_templates (name, filePath, type) VALUES
('Formato de registro de cursos de formación a lo largo de la vida', 'assets/templates/01 FS20H 2024-2.docx', 'file'),
('Lista de cotejo para formato de registro de cursos', 'assets/templates/01 LC20H 2024-2.xlsx', 'file'),
('Oficio de visto bueno proporcionado por la DEV', 'https://www.ipn.mx/dev/servicios/evaluacion-rdd.html', 'url'),
('Formato de protesta de autoría', 'assets/templates/02 FPA20H 2024.docx', 'file'),
('Carta aval', 'assets/templates/05 CA-ejemplo.pdf', 'file');

INSERT INTO certificate_documents_templates (name, filePath, type, required) VALUES
('Oficio de Solicitud', NULL, 'file', true),
('Formato de Lista de Asistencia', 'assets/certificate_documents_templates/lista-asistencia.xlsx', 'file', true),
('Facturas / Comprobante de Pago', NULL, 'file', true);

INSERT INTO document_access (document_id, modality, required) VALUES
(3, 'non-schooled', 1),
(3, 'mixed', 1),
(1, 'schooled', 1), 
(1, 'non-schooled', 1), 
(1, 'mixed', 1), 
(2, 'schooled', 1), 
(2, 'non-schooled', 1),
(2, 'mixed', 1), 
(4, 'schooled', 1), 
(4, 'non-schooled', 1),
(4, 'mixed', 1),
(5, 'schooled', 0), 
(5, 'non-schooled', 0),
(5, 'mixed', 0); 

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ PRUEBAS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Insertar administrador para cada centro
CALL sp_insert_user('admin_chihuahua', 'pass_chihuahua', 'Carlos', 'Hernández', 'López', 'Centro de Innovación e Integración de Tecnologías Avanzadas Chihuahua');
CALL sp_insert_user('admin_puebla', 'pass_puebla', 'María', 'García', 'Martínez', 'Centro de Innovación e Integración de Tecnologías Avanzadas Puebla');
CALL sp_insert_user('admin_veracruz', 'pass_veracruz', 'Sebastián', 'Morales', 'Palacios', 'Centro de Innovación e Integración de Tecnologías Avanzadas Veracruz');
CALL sp_insert_user('admin_cajeme', 'pass_cajeme', 'Ana', 'Martínez', 'Pérez', 'Centro de Vinculación y Desarrollo Regional Unidad Cajeme');
CALL sp_insert_user('admin_campeche', 'pass_campeche', 'Jorge', 'Díaz', 'Ramírez', 'Centro de Vinculación y Desarrollo Regional Unidad Campeche');
CALL sp_insert_user('admin_cancun', 'pass_cancun', 'Sofía', 'Jiménez', 'Vargas', 'Centro de Vinculación y Desarrollo Regional Unidad Cancún');
CALL sp_insert_user('admin_culiacan', 'pass_culiacan', 'Roberto', 'Torres', 'Morales', 'Centro de Vinculación y Desarrollo Regional Culiacán');
CALL sp_insert_user('admin_durango', 'pass_durango', 'Daniela', 'Sánchez', 'Ortega', 'Centro de Vinculación y Desarrollo Regional Durango');
CALL sp_insert_user('admin_losmochis', 'pass_losmochis', 'Ricardo', 'Pérez', 'Castillo', 'Centro de Vinculación y Desarrollo Regional Unidad Los Mochis');
CALL sp_insert_user('admin_mazatlan', 'pass_mazatlan', 'Fernanda', 'Ruiz', 'Gómez', 'Centro de Desarrollo y Vinculación Regional Unidad Mazatlán');
CALL sp_insert_user('admin_morelia', 'pass_morelia', 'Miguel', 'Hernández', 'Lara', 'Centro de Vinculación y Desarrollo Regional Unidad Morelia');
CALL sp_insert_user('admin_tlaxcala', 'pass_tlaxcala', 'Valeria', 'Castillo', 'Núñez', 'Centro de Vinculación y Desarrollo Regional Unidad Tlaxcala');
CALL sp_insert_user('admin_oaxaca', 'pass_oaxaca', 'Héctor', 'Cruz', 'Mendoza', 'Centro de Vinculación y Desarrollo Regional Unidad Oaxaca');
CALL sp_insert_user('admin_tijuana', 'pass_tijuana', 'Gabriela', 'Flores', 'Ramos', 'Centro de Vinculación y Desarrollo Regional Unidad Tijuana');
CALL sp_insert_user('admin_tampico', 'pass_tampico', 'Eduardo', 'Rojas', 'Peña', 'Centro de Vinculación y Desarrollo Regional Unidad Tampico');

-- SELECT COUNT(*) FROM courses WHERE YEAR(created_at) = 2025;
-- CALL sp_check_username('admin', @user_exists);
-- SELECT @user_exists;
 SELECT * FROM courses;
 SELECT * FROM course_sessions;
-- SELECT * FROM course_schedules WHERE session_id = 2;
/*
UPDATE course_sessions 
SET status = 'pending' 
WHERE id = 2;
*/


 /*
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE nombre_de_la_tabla;
SET FOREIGN_KEY_CHECKS = 1;
*/

 
-- SELECT * FROM actors_general_information;
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
/*
SELECT dt.id AS document_id, dt.name AS document_name, dt.filePath, dt.type, da.modality
FROM documents_templates dt
JOIN document_access da ON dt.id = da.document_id
WHERE da.modality = 'non-schooled';*/
/*
CALL sp_register_instructor_general_info(
    'Juan',                     -- p_first_name
    'Pérez',                    -- p_last_name
    'Gómez',                    -- p_second_last_name
    'Calle Principal',          -- p_street
    '123',                      -- p_house_number
    'Centro',                   -- p_neighborhood
    '12345',                    -- p_postal_code
    'Municipio Central',        -- p_municipality
    'Estado Ejemplo',           -- p_state
    'juan.perez@example.com',   -- p_email
    '5551234567',               -- p_landline_phone
    '5557654321',               -- p_mobile_phone
    'Matemáticas',              -- p_knowledge_area
    'Centro de Vinculación y Desarrollo Regional Unidad Tlaxcala',       -- p_center_name
    @status_code,               -- p_status_code (OUT)
    @message                    -- p_message (OUT)
);

-- Consultar los valores de los parámetros de salida
SELECT @status_code AS status_code, @message AS message;
*/


-- SELECT * FROM actors_general_information;
/*
CALL sp_register_instructor_all(
    'Juan',                       -- p_first_name
    'Pérez',                      -- p_last_name
    'López',                      -- p_second_last_name
    'Calle Principal',            -- p_street
    '123',                        -- p_house_number
    'Colonia Centro',             -- p_neighborhood
    '12345',                      -- p_postal_code
    'Ciudad XYZ',                 -- p_municipality
    'Estado ABC',                 -- p_state
    'juan.perez@example.com',     -- p_email
    '1234567890',                 -- p_landline_phone
    '9876543210',                 -- p_mobile_phone
    'Matemáticas',                -- p_knowledge_area
    'Centro de Innovación e Integración de Tecnologías Avanzadas Chihuahua',     -- p_center_name

    -- JSON con historial académico
    JSON_ARRAY(
        JSON_OBJECT(
            'education_level', 'Licenciatura',
            'period', '2010-2014',
            'institution', 'Universidad ABC',
            'degree_awarded', 'Matemáticas',
            'evidence_path', '/evidence/licenciatura.pdf'
        ),
        JSON_OBJECT(
            'education_level', 'Maestría',
            'period', '2015-2017',
            'institution', 'Universidad DEF',
            'degree_awarded', 'Estadística',
            'evidence_path', '/evidence/maestria.pdf'
        )
    ),

    -- JSON con experiencia profesional
    JSON_ARRAY(
        JSON_OBJECT(
            'period', '01/2018-12/2020',
            'organization', 'Empresa ABC',
            'position', 'Analista',
            'activity', 'Análisis de datos financieros',
            'evidence_path', '/evidence/experiencia1.pdf'
        ),
        JSON_OBJECT(
            'period', '01/2021-06/2023',
            'organization', 'Empresa XYZ',
            'position', 'Consultor',
            'activity', 'Consultoría en proyectos estadísticos',
            'evidence_path', '/evidence/experiencia2.pdf'
        )
    ),

    @status_code,                 -- p_status_code (salida)
    @message                      -- p_message (salida)
);
CALL sp_register_instructor_all(
    'Juan', 'Pérez', 'García', 'Calle Falsa', '123', 'Centro',
    '12345', 'Ciudad', 'Estado', 'juan.perez@example.com',
    '1234567890', '0987654321', 'Matemáticas, Física', 'Centro de Vinculación y Desarrollo Regional Unidad Tampico',
    '[{"education_level": "Licenciatura", "period": "2010-2014", "institution": "Universidad ABC", "degree_awarded": "Licenciado en Matemáticas", "evidence_path": "assets/files/instructors-documentation/folder/academic-history/evidence.pdf"}]',
    '[{"period":"09/2024 - 04/2025","organization":"DVDR","position":"Desarrollador","activity":"Desarrollo aplicación cursos","evidence_path":"assets/files/instructors-documentation/e82362d9-1f63-4acd-9fda-fc22f0b4a73f/work-experience/8c.pdf"}]',
    @status_code, @message
);

-- Consultar los valores de salida
SELECT @status_code AS status_code, @message AS message;*/
/*
SELECT 
    agi.id AS "ID Actor",
    agi.first_name AS "Nombre",
    agi.last_name AS "Apellido Paterno",
    agi.second_last_name AS "Apellido Materno",
    agi.email AS "Correo Electrónico",
    agi.knowledge_area AS "Área de Conocimiento",
    agi.center_type AS "Tipo de Centro",
    agi.center_identifier AS "Identificador del Centro",
    agi.approval_status AS "Estatus de Aprobación",
    ah.education_level AS "Nivel Educativo",
    ah.period AS "Periodo Educativo",
    ah.institution AS "Institución Educativa",
    ah.degree_awarded AS "Título Obtenido",
    ah.evidence_path AS "Evidencia Académica",
    pe.period AS "Periodo Profesional",
    pe.organization AS "Organización",
    pe.position AS "Puesto Ocupado",
    pe.activity AS "Actividad Profesional",
    pe.evidence_path AS "Evidencia Profesional"
FROM actors_general_information agi
LEFT JOIN academic_history ah ON agi.id = ah.actor_id
LEFT JOIN professional_experience pe ON agi.id = pe.actor_id
WHERE agi.id = 1; -- Reemplaza '?' con el ID del actor

*/
/*
CALL sp_register_course(
    'Curso de Programación',
    'Capacitación',
    'Tecnología',
    'Acuerdo123',
    40,
    'Presencial',
    'Oferta Educativa A',
    '[""Google Meet"",""Microsoft Teams""]',
    'Plataforma Y',
    'CURS123',
    'admin',
    '[{"document_id": 1, "filePath": "ruta/documento1.pdf"}, {"document_id": 2, "filePath": "ruta/documento2.pdf"}]',
    '[{"actor_id": 1, "role": "Instructor"}]',
    @status_code,
    @message
);

SELECT @status_code, @message; 
*/

-- CURSOS
 /*
SELECT 
    c.id AS course_id,
    c.course_name,
    c.service_type,
    c.category,
    c.modality,
    c.educational_offer,
    c.course_key,
    u.username AS registered_by,
    c.created_at
FROM courses c
INNER JOIN users u ON c.user_id = u.id;

SELECT 
    c.course_name,
    agi.first_name AS actor_first_name,
    agi.last_name AS actor_last_name,
    car.role
FROM course_actor_roles car
INNER JOIN courses c ON car.course_id = c.id
INNER JOIN actors_general_information agi ON car.actor_id = agi.id
ORDER BY c.course_name, car.role;


SELECT 
    c.course_name,
    dt.name AS document_name,
    cd.filePath AS uploaded_file_path
FROM course_documentation cd
INNER JOIN courses c ON cd.course_id = c.id
INNER JOIN documents_templates dt ON cd.document_id = dt.id
ORDER BY c.course_name, dt.name;


SELECT 
    c.course_name,
    c.status AS current_status,
    c.approval_status,
    c.admin_notes
FROM courses c
ORDER BY c.approval_status, c.course_name;

SELECT 
    c.course_name,
    COUNT(car.id) AS total_actors
FROM courses c
LEFT JOIN course_actor_roles car ON c.id = car.course_id
GROUP BY c.id
ORDER BY total_actors DESC, c.course_name;


SELECT 
    c.course_name,
    COUNT(cd.id) AS total_documents
FROM courses c
LEFT JOIN course_documentation cd ON c.id = cd.course_id
GROUP BY c.id
ORDER BY total_documents DESC, c.course_name;


SELECT 
    u.username,
    c.course_name,
    c.created_at
FROM courses c
INNER JOIN users u ON c.user_id = u.id
ORDER BY u.username, c.created_at;
*/ 

/*
UPDATE courses
SET approval_status = 'approved'
WHERE id = 1;

UPDATE courses
SET status = 'submitted'
WHERE id = 3;
*/
/*
ALTER TABLE courses MODIFY COLUMN expiration_date DATE NULL;

UPDATE courses 
SET expiration_date = '2020-01-29' 
WHERE id = 1;*/
