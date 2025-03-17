# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ CREACIÓN E INICIALIZACIÓN DE LA BASE DE DATOS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
CREATE DATABASE dvdr_cursos;
USE dvdr_cursos;

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ TABLAS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
CREATE TABLE centers (
   id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('CITTA', 'CVDR', 'UA') NOT NULL,
    identifier INT NOT NULL,
    UNIQUE KEY (type, identifier),
    director_full_name VARCHAR(50),
    academic_title VARCHAR(50),
    gender  ENUM('H', 'M') NOT NULL NOT NULL -- Hombre o Mujer
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    second_last_name VARCHAR(100),
    center_id INT, 
    role ENUM('root', 'user', 'verifier') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (center_id) REFERENCES centers(id)
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
    landline_phone VARCHAR(15),
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
   verification_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' NOT NULL,

   admin_notes TEXT,
   verification_notes TEXT,
   
   is_renewed TINYINT(1) NOT NULL DEFAULT 0,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   
   -- CAMPOS para manejar vigencia y renovaciones
   expiration_date DATE,         -- Fecha de vencimiento
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
    filePath VARCHAR(2083) NOT NULL,
    type ENUM('file', 'url') DEFAULT 'file' NOT NULL
);

CREATE TABLE diplomas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  total_duration INT,
  diploma_key VARCHAR(50),
  service_type VARCHAR(50),        
  modality VARCHAR(50) ,           
  educational_offer ENUM('DEMS','DES'),
  
  status ENUM('active','finished','ongoing') DEFAULT 'ongoing',
  approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' NOT NULL,
  verification_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' NOT NULL, 
  
  cost DECIMAL(10, 2) DEFAULT 0,
  participants INT DEFAULT 0,
  number_of_certificates INT DEFAULT 0,
  start_date DATE,
  end_date DATE,
  expiration_date DATE,
  user_id INT NOT NULL,
  center VARCHAR(100) NOT NULL,
  certificates_requested TINYINT(1) DEFAULT 0,
  certificates_delivered TINYINT(1) DEFAULT 0,
  official_letter_path VARCHAR(255) DEFAULT NULL,
  documentation_folder VARCHAR (255) DEFAULT NULL,
  verification_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE documents_templates_diplomae (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    filePath VARCHAR(2083), 
    type ENUM('file', 'url') DEFAULT 'file' NOT NULL,
	required BOOLEAN DEFAULT true
);

CREATE TABLE diploma_actor_roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  diploma_id INT NOT NULL,
  actor_id INT NOT NULL,                -- Relación con actors_general_information
  role VARCHAR(50) NOT NULL,            -- Rol del actor en el diplomado
  FOREIGN KEY (diploma_id) REFERENCES diplomas(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_id) REFERENCES actors_general_information(id) ON DELETE CASCADE
);

CREATE TABLE diploma_documentation (
  id INT PRIMARY KEY AUTO_INCREMENT,
  diploma_id INT NOT NULL,
  document_id INT NOT NULL,             
  filePath VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (diploma_id) REFERENCES diplomas(id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES documents_templates_diplomae(id) ON DELETE CASCADE
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
    cost DECIMAL(10,2) NOT NULL DEFAULT 0,  -- Costo unitario del curso
    status ENUM('pending', 'opened', 'completed') NOT NULL DEFAULT 'opened', -- Estatus del curso (Aperturado, Concluido, En espera)
    approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' NOT NULL,
    documentation_folder VARCHAR(255) DEFAULT NULL,
    signed_request_letter_path VARCHAR(255) DEFAULT NULL,
    certificates_requested TINYINT(1) DEFAULT 0,
    certificates_delivered TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (course_id) REFERENCES courses(id) 
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE session_certificates_request_documentation (
	id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL, -- Relación con cursos
    document_id INT NOT NULL, -- Relación con plantillas de documentos
    filePath VARCHAR(255) NOT NULL, -- Ruta al documento cargado o personalizado
	uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES course_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES certificate_documents_templates(id) ON DELETE CASCADE
);

-- Creación de tabla para documentación de solicitud de certificados de diplomados
CREATE TABLE diploma_certificates_request_documentation (
    id INT PRIMARY KEY AUTO_INCREMENT,
    diploma_id INT NOT NULL,
    document_id INT NOT NULL,
    filePath VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (diploma_id) REFERENCES diplomas(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES certificate_documents_templates(id) ON DELETE CASCADE
);

-- para relacionar la sesión del curso con el acuse que sube el administrador
CREATE TABLE session_certificate (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL, -- Relación con la sesión del curso
    filePath VARCHAR(255) NOT NULL, -- Ruta al documento de acuse
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES course_sessions(id) ON DELETE CASCADE
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

CREATE TABLE session_certificate_official_letter (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL,  -- Relación con la sesión del curso
    filePath VARCHAR(255) NOT NULL,  -- Ruta al archivo del oficio de envío
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Fecha de carga del oficio

    FOREIGN KEY (session_id) REFERENCES course_sessions(id) ON DELETE CASCADE
);

CREATE TABLE diploma_official_letter (
    id INT PRIMARY KEY AUTO_INCREMENT,
    diploma_id INT NOT NULL,  -- Relación con el diplomado
    filePath VARCHAR(255) NOT NULL,  -- Ruta al archivo del oficio de envío
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Fecha de carga del oficio
    
    FOREIGN KEY (diploma_id) REFERENCES diplomas(id) ON DELETE CASCADE
);

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attended BOOLEAN DEFAULT FALSE,
    attended_at TIMESTAMP NULL,
    attended_by INT NULL,
    FOREIGN KEY (attended_by) REFERENCES users(id)
);

CREATE TABLE tutorial_videos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    video_url VARCHAR(2083) NOT NULL,
    thumbnail_url VARCHAR(2083) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ PROCEDMIENTOS ALMACENADOS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Procedimiento para dar de alta un usuario
DELIMITER $$
CREATE PROCEDURE sp_insert_user(
    IN p_username VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255),
    IN p_first_name VARCHAR(100),
    IN p_last_name VARCHAR(100),
    IN p_second_last_name VARCHAR(100),
    IN p_center VARCHAR(255),
    IN p_role VARCHAR(10),
    OUT p_status_code INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE hashed_password VARCHAR(255);
    DECLARE v_center_id INT;
    DECLARE v_user_exists INT;

    -- Manejo de errores
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        SET p_status_code = -1;
        SET p_message = 'Error: No se pudo insertar el usuario. Verifique los datos.';
    END;

    START TRANSACTION;

    -- Verificar si el usuario o el correo ya existen
    SELECT COUNT(*) INTO v_user_exists
    FROM users
    WHERE username = p_username OR email = p_email;

    IF v_user_exists > 0 THEN
        SET p_status_code = -1;
        SET p_message = 'Error: El nombre de usuario o correo electrónico ya existe.';
        ROLLBACK;
    END IF;

    -- Determinar el valor de center_id
    IF p_role = 'root' THEN
        SET v_center_id = NULL;
    ELSE
        SELECT id INTO v_center_id
        FROM centers
        WHERE name = p_center
        LIMIT 1;

        IF v_center_id IS NULL THEN
            SET p_status_code = -1;
            SET p_message = 'Error: El centro especificado no existe.';
            ROLLBACK;
        END IF;
    END IF;

    -- Hashear la contraseña
    SET hashed_password = SHA2(p_password, 256);

    -- Insertar el nuevo usuario
    INSERT INTO users (
      username, 
      email, 
      password, 
      first_name, 
      last_name, 
      second_last_name, 
      center_id, 
      role
    )
    VALUES (
      p_username, 
      p_email, 
      hashed_password, 
      p_first_name, 
      p_last_name, 
      p_second_last_name, 
      v_center_id, 
      p_role
    );

    COMMIT;

    SET p_status_code = 1;
    SET p_message = 'Usuario insertado correctamente';
END$$
DELIMITER ;

-- Procedimiento para verificar si un usuario corresponde con su contraseña
DELIMITER $$
CREATE PROCEDURE sp_verify_user(
    IN p_username VARCHAR(50),
    IN p_password VARCHAR(255),
    OUT p_is_valid BOOLEAN,
    OUT p_user_center VARCHAR(100),
    OUT p_user_role VARCHAR(10)
)
BEGIN
    DECLARE stored_password VARCHAR(255);
    DECLARE user_center VARCHAR(100);
    DECLARE v_role VARCHAR(10);

    -- Manejo de errores
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_is_valid = FALSE;
        SET p_user_center = NULL;
        SET p_user_role = NULL;
    END;

    START TRANSACTION;

    -- Se usa LEFT JOIN porque un usuario administrador puede tener center_id = NULL
    SELECT u.password, c.name, u.role
    INTO stored_password, user_center, v_role
    FROM users u
    LEFT JOIN centers c ON u.center_id = c.id
    WHERE u.username = p_username
    LIMIT 1;

    -- Si no se encuentra el usuario o la contraseña es nula, se considera fallo en la validación
    IF stored_password IS NULL THEN
        SET p_is_valid = FALSE;
        SET p_user_center = NULL;
        SET p_user_role = NULL;
    ELSE
        IF SHA2(p_password, 256) = stored_password THEN
            SET p_is_valid = TRUE;
            SET p_user_center = user_center;
            SET p_user_role = v_role;
        ELSE
            SET p_is_valid = FALSE;
            SET p_user_center = NULL;
            SET p_user_role = NULL;
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
        c.status,
        c.approval_status,
        c.admin_notes,
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
CREATE PROCEDURE sp_get_all_courses()
BEGIN
    -- Seleccionar datos generales de todos los cursos
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
        c.created_at, -- Incluir la fecha de creación
        c.status, -- Incluir el status
        c.approval_status, -- Incluir el approval_status
        c.verification_status,
        u.username AS created_by,
		ctr.name AS center_name  -- nombre del centro
    FROM courses c
    JOIN users u ON c.user_id = u.id
	LEFT JOIN centers ctr ON u.center_id = ctr.id;
    
    -- Seleccionar actores y roles asociados a todos los cursos
    SELECT 
        car.course_id,
        a.id AS actor_id,
        CONCAT(a.first_name, ' ', a.last_name, ' ', a.second_last_name) AS actor_name,
        car.role
    FROM course_actor_roles car
    JOIN actors_general_information a ON car.actor_id = a.id;

    -- Seleccionar documentación de todos los cursos
    SELECT 
        cd.course_id,
        d.id AS document_id,
        d.name AS document_name,
        cd.filePath
    FROM course_documentation cd
    JOIN documents_templates d ON cd.document_id = d.id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_register_course_session(
    IN p_course_id INT,
    IN p_period VARCHAR(255),
    IN p_num_participants INT,
    IN p_num_certificates INT,
    IN p_cost DECIMAL(10,2),    
    IN p_schedule_json JSON,
    IN p_documentation_folder VARCHAR(255),
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

    -- Insertar sesión del curso con el nuevo campo documentation_folder
    INSERT INTO course_sessions (
        course_id, 
        period, 
        number_of_participants, 
        number_of_certificates,
        cost,
        status,
        approval_status,
        documentation_folder
    )
    VALUES (
        p_course_id, 
        p_period, 
        p_num_participants, 
        p_num_certificates,
        p_cost,
        'opened',
        'pending',
        p_documentation_folder
    );

    SET v_session_id = LAST_INSERT_ID();

    -- Insertar cronograma
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
    SET p_status_code = 1;
    SET p_message = 'Sesión de curso y cronograma guardados exitosamente.';
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_upload_signed_request_letter(
    IN p_session_id INT,
    IN p_file_path VARCHAR(255),
    OUT p_status_code INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_exists INT;
    
    -- Verificar que la sesión existe
    SELECT COUNT(*) INTO v_exists
    FROM course_sessions
    WHERE id = p_session_id;
    
    IF v_exists = 0 THEN
        SET p_status_code = 404;
        SET p_message = 'La sesión no existe';
    END IF;
    
    START TRANSACTION;
    
    -- Actualizar la ruta del PDF firmado
    UPDATE course_sessions
    SET signed_request_letter_path = p_file_path
    WHERE id = p_session_id;
    
    COMMIT;
    
    SET p_status_code = 200;
    SET p_message = 'PDF firmado subido exitosamente';
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_approve_course_session(
    IN p_session_id INT,
    OUT p_status_code INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_exists INT;
    
    -- Verificar que la sesión existe y está pendiente
    SELECT COUNT(*) INTO v_exists
    FROM course_sessions
    WHERE id = p_session_id AND approval_status = 'pending';
    
    IF v_exists = 0 THEN
        SET p_status_code = 404;
        SET p_message = 'La sesión no existe o no está pendiente';
    END IF;
    
    START TRANSACTION; -- También faltaba iniciar una transacción
    
    -- Actualizar el estado a aprobado
    UPDATE course_sessions
    SET 
        approval_status = 'approved',
        status = 'opened'
    WHERE id = p_session_id;
    
    COMMIT; -- Y confirmar la transacción
    
    SET p_status_code = 200;
    SET p_message = 'Sesión aprobada exitosamente';
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_reject_course_session(
    IN p_session_id INT,
    OUT p_status_code INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_exists INT;
    
    -- Verificar que la sesión existe
    SELECT COUNT(*) INTO v_exists
    FROM course_sessions
    WHERE id = p_session_id;
    
    IF v_exists = 0 THEN
        SET p_status_code = 404;
        SET p_message = 'La sesión no existe';
    END IF;
    
    START TRANSACTION;
    
    -- Eliminar el cronograma
    DELETE FROM course_schedules 
    WHERE session_id = p_session_id;
    
    -- Eliminar la sesión
    DELETE FROM course_sessions 
    WHERE id = p_session_id;
    
    COMMIT;
    
    SET p_status_code = 200;
    SET p_message = 'Sesión rechazada y eliminada exitosamente';
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_get_pending_apertures()
BEGIN
    -- Primer resultset: Información principal
    SELECT 
        cs.id as session_id,
        c.course_key,
        c.course_name,
        cs.period,
        cs.number_of_participants,
        cs.number_of_certificates,
        cs.cost,
        cs.signed_request_letter_path,
        -- Información del centro y director
        ctr.name AS center_name,
        ctr.director_full_name AS director_name,
        ctr.academic_title AS director_title,
        ctr.gender AS director_gender,
        -- Resto de información del curso
        c.modality,
        c.total_duration,
        MIN(csch.date) as start_date,
        MAX(csch.date) as end_date,
        COUNT(DISTINCT csch.date) as total_days,
        GROUP_CONCAT(
            DISTINCT CONCAT(
                agi.first_name, ' ', 
                agi.last_name, ' ', 
                COALESCE(agi.second_last_name, ''),
                ' (', car.role, ')'
            ) 
            SEPARATOR '; '
        ) as instructors
    FROM course_sessions cs
    JOIN courses c ON cs.course_id = c.id
    JOIN users u ON c.user_id = u.id
    JOIN centers ctr ON u.center_id = ctr.id
    LEFT JOIN course_schedules csch ON cs.id = csch.session_id
    LEFT JOIN course_actor_roles car ON c.id = car.course_id
    LEFT JOIN actors_general_information agi ON car.actor_id = agi.id
    WHERE cs.approval_status = 'pending'
    GROUP BY 
        cs.id, c.course_key, c.course_name, cs.period,
        cs.number_of_participants, cs.number_of_certificates,
        cs.cost, ctr.name, c.modality, c.total_duration,
        ctr.director_full_name, ctr.academic_title, ctr.gender;

    -- Segundo resultset: Cronograma (sin cambios)
    SELECT 
        cs.id as session_id,
        csch.date,
        csch.start_time,
        csch.end_time
    FROM course_sessions cs
    JOIN course_schedules csch ON cs.id = csch.session_id
    WHERE cs.approval_status = 'pending'
    ORDER BY cs.id, csch.date, csch.start_time;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_get_user_pending_apertures(
    IN p_username VARCHAR(50)
)
BEGIN
    -- Obtener el centro del usuario
    DECLARE v_center_id INT;
    
    SELECT u.center_id INTO v_center_id
    FROM users u
    WHERE u.username = p_username;
    
    -- Primer resultset: Información principal de las aperturas del mismo centro
    SELECT 
        cs.id as sessionId,
        c.course_key as courseKey,
        c.course_name as courseName,
        cs.period,
        cs.number_of_participants as numberOfParticipants,
        cs.number_of_certificates as numberOfCertificates,
        cs.cost,
        cs.signed_request_letter_path as signedRequestLetterPath,
        cs.approval_status as approvalStatus,
        -- Información del centro y director
        ctr.name AS centerName,
        ctr.director_full_name AS directorName,
        ctr.academic_title AS directorTitle,
        ctr.gender AS directorGender,
        -- Resto de información del curso
        c.modality,
        c.total_duration as totalDuration,
        MIN(csch.date) as startDate,
        MAX(csch.date) as endDate,
        COUNT(DISTINCT csch.date) as totalDays,
        -- Indicador si está firmado o no
        IF(cs.signed_request_letter_path IS NULL OR cs.signed_request_letter_path = '', 0, 1) AS signed,
        GROUP_CONCAT(
            DISTINCT CONCAT(
                agi.first_name, ' ', 
                agi.last_name, ' ', 
                COALESCE(agi.second_last_name, ''),
                ' (', car.role, ')'
            ) 
            SEPARATOR '; '
        ) as instructors
    FROM course_sessions cs
    JOIN courses c ON cs.course_id = c.id
    JOIN users u ON c.user_id = u.id
    JOIN centers ctr ON u.center_id = ctr.id
    LEFT JOIN course_schedules csch ON cs.id = csch.session_id
    LEFT JOIN course_actor_roles car ON c.id = car.course_id
    LEFT JOIN actors_general_information agi ON car.actor_id = agi.id
    WHERE ctr.id = v_center_id
    GROUP BY 
        cs.id, c.course_key, c.course_name, cs.period,
        cs.number_of_participants, cs.number_of_certificates,
        cs.cost, ctr.name, c.modality, c.total_duration,
        ctr.director_full_name, ctr.academic_title, ctr.gender,
        cs.signed_request_letter_path, cs.approval_status;

    -- Segundo resultset: Cronograma 
    SELECT 
        cs.id as sessionId,
        csch.date,
        csch.start_time as start,
        csch.end_time as end
    FROM course_sessions cs
    JOIN course_schedules csch ON cs.id = csch.session_id
    JOIN courses c ON cs.course_id = c.id
    JOIN users u ON c.user_id = u.id
    JOIN centers ctr ON u.center_id = ctr.id
    WHERE ctr.id = v_center_id
    ORDER BY cs.id, csch.date, csch.start_time;
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
        c.expiration_date,
        c.status AS course_status,  -- Añadir esta línea
        c.approval_status AS approval_status  -- Añadir esta línea
    FROM courses c
    WHERE c.user_id = v_user_id
    ORDER BY c.course_name, c.renewal_count;

    -- Obtener las sesiones de cada curso y sus renovaciones
    SELECT 
        cs.id AS session_id,
        c.course_key AS clave,
        cs.period AS periodo,
        cs.number_of_participants AS participantes,
        cs.number_of_certificates AS constancias,
        cs.status AS estatus,
        cs.certificates_requested AS certificates_requested,
        cs.certificates_delivered AS certificates_delivered
    FROM course_sessions cs
    JOIN courses c ON cs.course_id = c.id
    WHERE c.user_id = v_user_id
    ORDER BY c.course_name, cs.period;
    
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_request_certificates(
    IN p_session_id INT,
    IN p_documentation JSON,
    OUT p_status_code INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    -- Manejo de errores
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        SET p_status_code = -1;
        SET p_message = 'Error: No se pudo registrar la solicitud de constancias.';
    END;

    START TRANSACTION;

    -- Actualizar la bandera de solicitud de constancias
    UPDATE course_sessions
    SET certificates_requested = 1
    WHERE id = p_session_id;

    -- Insertar documentación relacionada con la solicitud de constancias usando JSON_TABLE
    INSERT INTO session_certificates_request_documentation (
        session_id,
        document_id,
        filePath
    )
    SELECT
        p_session_id,
        d.document_id,
        d.filePath
    FROM
        JSON_TABLE(
            p_documentation,
            '$[*]'
            COLUMNS (
                document_id INT PATH '$.document_id',
                filePath VARCHAR(255) PATH '$.filePath'
            )
        ) AS d;

    COMMIT;

    -- Confirmación de éxito
    SET p_status_code = 1;
    SET p_message = 'Solicitud de constancias registrada exitosamente.';
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_get_course_sessions(
    IN p_course_id INT
)  
BEGIN
    -- Obtener información de las sesiones del curso
    SELECT 
        cs.id AS session_id,
        cs.period,
        cs.number_of_participants,
        cs.number_of_certificates,
        cs.cost,
        cs.status,
        cs.certificates_requested,
        cs.created_at,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'date', DATE_FORMAT(csh.date, '%Y-%m-%d'),
                'start', TIME_FORMAT(csh.start_time, '%H:%i'),
                'end', TIME_FORMAT(csh.end_time, '%H:%i')
            )
        ) AS schedule
    FROM course_sessions cs
    LEFT JOIN course_schedules csh ON cs.id = csh.session_id
    WHERE cs.course_id = p_course_id
    GROUP BY 
        cs.id, 
        cs.period, 
        cs.number_of_participants, 
        cs.number_of_certificates,
        cs.cost,
        cs.status,
        cs.certificates_requested,
        cs.created_at
    ORDER BY cs.created_at DESC;

END$$
DELIMITER ;

DELIMITER $$  
CREATE PROCEDURE sp_get_certificates_requested_sessions()  
BEGIN  
    -- Seleccionar las sesiones que solicitaron constancias y no han sido entregadas  
    SELECT   
        cs.id AS session_id,  
        cs.course_id,  
        c.course_key,  -- Agregamos la clave del curso  
        c.course_name,  
        cs.period,  
        cs.number_of_participants,  
        cs.number_of_certificates,  
        cs.cost,  
        cs.status,  
        cs.certificates_requested,  
        cs.certificates_delivered,
        cs.created_at  
    FROM course_sessions cs  
    JOIN courses c ON cs.course_id = c.id  
    WHERE cs.certificates_requested = 1  
      AND cs.certificates_delivered = 0;  

    -- Obtener la documentación asociada a cada solicitud de constancias  
    SELECT   
        scrd.session_id,  
        d.id AS document_id,  
        d.name AS document_name,  
        scrd.filePath  
    FROM session_certificates_request_documentation scrd  
    JOIN certificate_documents_templates d ON scrd.document_id = d.id  
    JOIN course_sessions cs ON scrd.session_id = cs.id  
    WHERE cs.certificates_requested = 1  
      AND cs.certificates_delivered = 0;  
END$$  
DELIMITER ;  
 

DELIMITER $$
CREATE PROCEDURE sp_upload_certificate_official_letter(
    IN p_session_id INT,
    IN p_file_path VARCHAR(255),
    IN p_number_of_certificates INT,
    OUT p_status_code INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE sessionExists INT;

    -- Verificar si la sesión existe
    SELECT COUNT(*) INTO sessionExists 
    FROM course_sessions 
    WHERE id = p_session_id;

    IF sessionExists = 0 THEN
        SET p_status_code = 404;
        SET p_message = 'La sesión no existe';
    ELSE
        -- Insertar el oficio en la base de datos
        INSERT INTO session_certificate_official_letter (session_id, filePath)
        VALUES (p_session_id, p_file_path);

        -- Actualizar el número de constancias entregadas y marcar como entregadas
        UPDATE course_sessions
        SET 
            number_of_certificates = p_number_of_certificates,
            certificates_delivered = 1
        WHERE id = p_session_id;

        SET p_status_code = 200;
        SET p_message = 'Oficio subido y constancias marcadas como entregadas';
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_add_center(
    IN p_name VARCHAR(255),
    IN p_type ENUM('CITTA', 'CVDR', 'UA'),
    IN p_identifier INT,
    OUT p_status_code INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE existing_center_type INT;
    DECLARE existing_center_name INT;

    -- Manejo de errores
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        SET p_status_code = -1;
        SET p_message = 'Error: No se pudo registrar el centro.';
    END;

    START TRANSACTION;

    -- Verificar si ya existe un centro con el mismo tipo e identificador
    SELECT COUNT(*) INTO existing_center_type
    FROM centers 
    WHERE type = p_type AND identifier = p_identifier;

    -- Verificar si ya existe un centro con el mismo nombre
    SELECT COUNT(*) INTO existing_center_name
    FROM centers 
    WHERE name = p_name;

    -- Validaciones
    IF existing_center_type > 0 THEN
        SET p_status_code = -2;
        SET p_message = 'Error: Ya existe un centro con ese tipo e identificador.';
    ELSEIF existing_center_name > 0 THEN
        SET p_status_code = -3;
        SET p_message = 'Error: Ya existe un centro con ese nombre.';
    ELSE
        -- Insertar el nuevo centro
        INSERT INTO centers (name, type, identifier)
        VALUES (p_name, p_type, p_identifier);

        SET p_status_code = 1;
        SET p_message = 'Centro registrado exitosamente.';
    END IF;

    COMMIT;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_get_all_centers()
BEGIN
    SELECT 
        id,
        name,
        type,
        identifier
    FROM centers;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_update_user_password(
    IN p_username VARCHAR(50),
    IN p_new_password VARCHAR(255),
    OUT p_status_code INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE user_count INT;

    -- Verificar si el usuario existe
    SELECT COUNT(*) INTO user_count
    FROM users
    WHERE username = p_username;

    IF user_count = 0 THEN
        SET p_status_code = -1;
        SET p_message = 'Error: El usuario no existe.';
    ELSE
        -- Hashear la nueva contraseña usando SHA256
        SET @hashed_password = SHA2(p_new_password, 256);

        -- Actualizar la contraseña con el hash
        UPDATE users
        SET password = @hashed_password
        WHERE username = p_username;

        SET p_status_code = 1;
        SET p_message = 'La contraseña se actualizó correctamente.';
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_request_diploma_registration(
    IN p_username VARCHAR(50),
    IN p_documentation JSON,
    IN p_documentation_folder VARCHAR(50),
    OUT p_status_code INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_user_id INT;
    DECLARE v_diploma_id INT;
    DECLARE v_center VARCHAR(100);

    -- Manejo de errores
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        SET p_status_code = -1;
        SET p_message = 'Error: No se pudo registrar la solicitud del diplomado.';
    END;

    START TRANSACTION;

    -- Obtener user_id y center del usuario
    SELECT u.id, c.name INTO v_user_id, v_center
    FROM users u
    JOIN centers c ON u.center_id = c.id
    WHERE u.username = p_username;

    IF v_user_id IS NULL THEN
        SET p_status_code = -2;
        SET p_message = 'Error: Usuario no encontrado.';
        ROLLBACK;
    END IF;

    -- Crear un registro temporal en diplomas
    INSERT INTO diplomas (
        name,
        service_type,
        user_id,
        center,            -- Añadir el campo center
        approval_status,
		documentation_folder
    ) VALUES (
        'Pendiente de revisión',
        'Diplomado',
        v_user_id,
        v_center,         -- Incluir el valor del centro
        'pending',
        p_documentation_folder
    );

    SET v_diploma_id = LAST_INSERT_ID();

    -- Insertar la documentación usando JSON_TABLE
    INSERT INTO diploma_documentation (
        diploma_id,
        document_id,
        filePath,
        uploaded_at
    )
    SELECT
        v_diploma_id,
        d.document_id,
        d.filePath,
        CURRENT_TIMESTAMP
    FROM
        JSON_TABLE(
            p_documentation,
            '$[*]'
            COLUMNS (
                document_id INT PATH '$.document_id',
                filePath VARCHAR(255) PATH '$.filePath'
            )
        ) AS d;

    COMMIT;

    SET p_status_code = 1;
    SET p_message = 'Solicitud de registro de diplomado enviada correctamente.';
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_register_diploma(
    IN p_name VARCHAR(255),
    IN p_total_duration INT,
    IN p_diploma_key VARCHAR(50),
    IN p_service_type VARCHAR(50),
    IN p_modality VARCHAR(50),
    IN p_educational_offer ENUM('DEMS','DES'),
    IN p_cost DECIMAL(10, 2),
    IN p_participants INT,
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_expiration_date DATE,
    IN p_username VARCHAR(50),
    IN p_actor_roles JSON,
    OUT p_status_code INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_user_id INT;
    DECLARE v_diploma_id INT;

    -- Manejo de errores
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        SET p_status_code = -1;
        SET p_message = 'Error: No se pudo registrar el diplomado.';
    END;

    START TRANSACTION;

    -- Obtener el ID del usuario
    SELECT id INTO v_user_id
    FROM users
    WHERE username = p_username;

    IF v_user_id IS NULL THEN
        SET p_status_code = -2;
        SET p_message = 'Error: Usuario no encontrado.';
        ROLLBACK;
    END IF;

    -- Insertar el diplomado
    INSERT INTO diplomas (
        name,
        total_duration,
        diploma_key,
        service_type,
        modality,
        educational_offer,
        status,
        cost,
        participants,
        start_date,
        end_date,
        expiration_date,
        user_id,
        documentation_folder
    ) VALUES (
        p_name,
        p_total_duration,
        p_diploma_key,
        p_service_type,
        p_modality,
        p_educational_offer,
        'active',
        p_cost,
        p_participants,
        p_start_date,
        p_end_date,
        p_expiration_date,
        v_user_id
    );

    SET v_diploma_id = LAST_INSERT_ID();

    -- Insertar los actores y sus roles usando JSON_TABLE
    INSERT INTO diploma_actor_roles (
        diploma_id,
        actor_id,
        role
    )
    SELECT
        v_diploma_id,
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
    SET p_message = 'Diplomado registrado exitosamente.';
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_get_all_diplomas()
BEGIN
    /* 1er resultset: datos principales del diplomado */
    SELECT 
        d.id AS diploma_id,
        d.name,
        d.total_duration,
        d.diploma_key,
        d.service_type,
        d.modality,
        d.educational_offer,
        d.status,
        d.approval_status,
        d.cost,
        d.participants,
        d.start_date,
        d.end_date,
        d.expiration_date,
        d.user_id,
        d.center,
        d.created_at,
        d.updated_at,
        u.username AS registered_by,
        d.documentation_folder
    FROM diplomas d
    JOIN users u ON d.user_id = u.id
    ORDER BY d.created_at DESC;

    /* 2do resultset: actores y roles */
    SELECT 
        dar.diploma_id,
        dar.actor_id,
        CONCAT(agi.first_name, ' ', agi.last_name, ' ', agi.second_last_name) AS actor_name,
        dar.role
    FROM diploma_actor_roles dar
    JOIN actors_general_information agi ON dar.actor_id = agi.id;

    /* 3er resultset: TODAS las plantillas + el documento si existe */
    SELECT
        d.id AS diploma_id,
        dtd.id AS document_id,
        dtd.name AS document_name,
        dtd.type AS document_type,
        dtd.required,
        dd.filePath,
        dd.uploaded_at
    FROM diplomas d
    CROSS JOIN documents_templates_diplomae dtd
    LEFT JOIN diploma_documentation dd 
      ON dd.document_id = dtd.id 
      AND dd.diploma_id = d.id
    ORDER BY d.id, dtd.id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_approve_diploma_request(
    IN p_diploma_id INT,
    IN p_name VARCHAR(255),
    IN p_total_duration INT,
    IN p_diploma_key VARCHAR(50),
    IN p_service_type VARCHAR(50),
    IN p_modality VARCHAR(50),
    IN p_educational_offer ENUM('DEMS','DES'),
    IN p_cost DECIMAL(10, 2),
    IN p_participants INT,
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_expiration_date DATE,
    IN p_actor_roles JSON,
    OUT p_status_code INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_exists INT;

    -- Manejo de errores
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        SET p_status_code = -1;
        SET p_message = 'Error: No se pudo aprobar el diplomado.';
    END;

    START TRANSACTION;

    -- Verificar si existe el diplomado
    SELECT COUNT(*) INTO v_exists
    FROM diplomas
    WHERE id = p_diploma_id;

    IF v_exists = 0 THEN
        SET p_status_code = -2;
        SET p_message = 'Error: El diplomado no existe.';
        ROLLBACK;
    END IF;

    -- Actualizar la información del diplomado
    UPDATE diplomas
    SET
        name = p_name,
        total_duration = p_total_duration,
        diploma_key = p_diploma_key,
        service_type = p_service_type,
        modality = p_modality,
        educational_offer = p_educational_offer,
        status = 'active',
        approval_status = 'approved',
        cost = p_cost,
        participants = p_participants,
        start_date = p_start_date,
        end_date = p_end_date,
        expiration_date = p_expiration_date,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_diploma_id;

    -- Eliminar roles de actores existentes
    DELETE FROM diploma_actor_roles
    WHERE diploma_id = p_diploma_id;

    -- Insertar nuevos roles de actores
    INSERT INTO diploma_actor_roles (
        diploma_id,
        actor_id,
        role
    )
    SELECT
        p_diploma_id,
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
    SET p_message = 'Diplomado aprobado exitosamente.';
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_get_diplomas_by_center(
    IN p_center VARCHAR(100)
)
BEGIN
    -- Datos principales del diplomado
    SELECT 
        d.id AS diploma_id,
        d.name,
        d.total_duration,
        d.diploma_key,
        d.service_type,
        d.modality,
        d.educational_offer,
        d.status,
        d.approval_status,
        d.cost,
        d.participants,
        d.start_date,
        d.end_date,
        d.expiration_date,
        d.center,
        d.created_at,
        d.updated_at,
        u.username AS registered_by,
        d.documentation_folder
    FROM diplomas d
    JOIN users u ON d.user_id = u.id
    WHERE d.center = p_center
    ORDER BY d.created_at DESC;

    -- Actores y sus roles
    SELECT 
        dar.diploma_id,
        dar.actor_id,
        CONCAT(agi.first_name, ' ', agi.last_name, ' ', IFNULL(agi.second_last_name, '')) AS actor_name,
        dar.role,
        agi.knowledge_area
    FROM diploma_actor_roles dar
    JOIN actors_general_information agi ON dar.actor_id = agi.id
    JOIN diplomas d ON dar.diploma_id = d.id
    WHERE d.center = p_center;

    -- TODAS las plantillas + documentación existente
    SELECT
        d.id AS diploma_id,
        dtd.id AS document_id,
        dtd.name AS document_name,
        dtd.type AS document_type,
        dtd.required,
        dd.filePath,
        dd.uploaded_at
    FROM diplomas d
    CROSS JOIN documents_templates_diplomae dtd
    LEFT JOIN diploma_documentation dd 
      ON dd.document_id = dtd.id 
      AND dd.diploma_id = d.id
    WHERE d.center = p_center
    ORDER BY d.id, dtd.id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_get_completed_diplomas(IN p_username VARCHAR(50))
BEGIN
    SELECT 
        d.id AS diplomaId,
        d.name AS title,
        d.diploma_key AS clave,
        d.start_date AS startDate,
        d.end_date AS endDate,
        d.status,
        d.certificates_requested,
        d.certificates_delivered,
        d.official_letter_path
    FROM diplomas d
    JOIN users u ON d.user_id = u.id
    WHERE u.username = p_username
    AND d.status = 'finished'
    AND d.approval_status = 'approved'
    ORDER BY d.end_date DESC;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_request_diploma_certificates(
    IN p_diploma_id INT,
    IN p_documentation JSON,
    OUT p_status_code INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_exists INT;
    START TRANSACTION;
    
    -- Verificar si existe el diplomado y está completado
    SELECT COUNT(*) INTO v_exists
    FROM diplomas
    WHERE id = p_diploma_id 
    AND status = 'finished'  
    AND certificates_requested = 0;

    IF v_exists = 0 THEN
        SET p_status_code = -1;
        SET p_message = 'Diplomado no encontrado o ya tiene certificados solicitados';
    END IF;

    -- Marcar el diplomado como solicitado
    UPDATE diplomas
    SET certificates_requested = 1
    WHERE id = p_diploma_id;

    -- Insertar la documentación usando JSON_TABLE como en los otros SPs
    INSERT INTO diploma_certificates_request_documentation (
        diploma_id,
        document_id,
        filePath
    )
    SELECT
        p_diploma_id,
        d.document_id,
        d.filePath
    FROM
        JSON_TABLE(
            p_documentation,
            '$[*]'
            COLUMNS (
                document_id INT PATH '$.document_id',
                filePath VARCHAR(255) PATH '$.filePath'
            )
        ) AS d;

    COMMIT;

    SET p_status_code = 1;
    SET p_message = 'Solicitud de certificados registrada exitosamente';
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_upload_diploma_document(
    IN p_diploma_id INT,
    IN p_document_id INT,
    IN p_file_path VARCHAR(255),
    OUT p_status_code INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_exists INT;

    SELECT COUNT(*) INTO v_exists
    FROM diplomas
    WHERE id = p_diploma_id
    AND approval_status = 'approved';

    IF v_exists = 0 THEN
        SET p_status_code = -1;
        SET p_message = 'El diplomado no existe o no está aprobado';
    END IF;

    INSERT INTO diploma_documentation (diploma_id, document_id, filePath, uploaded_at)
    VALUES (p_diploma_id, p_document_id, p_file_path, NOW());

    SET p_status_code = 1;
    SET p_message = 'Documento de diplomado subido correctamente';
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_update_course_sessions_status()
BEGIN
    -- Actualizar el estado de las sesiones basado en la última fecha programada
    UPDATE course_sessions cs
    INNER JOIN (
        -- Subconsulta para obtener la última fecha de cada sesión
        SELECT 
            session_id,
            MAX(date) as last_session_date
        FROM course_schedules
        GROUP BY session_id
    ) last_dates ON cs.id = last_dates.session_id
    SET 
        cs.status = 'completed'
    WHERE 
        -- Asegurar que la condición usa una clave primaria (cs.id)
        cs.id IS NOT NULL
        AND last_dates.last_session_date < CURDATE()
        AND cs.status = 'opened'
		AND cs.id IS NOT NULL;
    -- Opcional: Retornar el número de sesiones actualizadas
    SELECT CONCAT(ROW_COUNT(), ' sesiones han sido actualizadas a completed') as result;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_get_requested_diploma_certificates()
BEGIN
    -- Obtener datos principales de los diplomados que han solicitado certificados
    SELECT 
        d.id AS diploma_id,
        d.name AS title,
        d.diploma_key AS clave,
        CONCAT(DATE_FORMAT(d.start_date, '%d/%m/%Y'), ' - ', DATE_FORMAT(d.end_date, '%d/%m/%Y')) AS period,
        d.participants AS number_of_certificates,
        d.status,
        d.certificates_requested,
        d.certificates_delivered,
        d.official_letter_path
    FROM diplomas d
    WHERE d.certificates_requested = 1 
    AND d.certificates_delivered = 0
    AND d.status = 'finished'
    AND d.approval_status = 'approved';

    -- Obtener la documentación asociada a cada solicitud
    SELECT 
        dcrd.diploma_id,
        cdt.id AS document_id,
        cdt.name,  -- Cambiado de document_name a name
        dcrd.filePath AS file_path,  -- Cambiado para coincidir con el código
        dcrd.uploaded_at
    FROM diploma_certificates_request_documentation dcrd
    JOIN certificate_documents_templates cdt ON dcrd.document_id = cdt.id
    JOIN diplomas d ON dcrd.diploma_id = d.id
    WHERE d.certificates_requested = 1 
    AND d.certificates_delivered = 0;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_upload_diploma_official_letter(
    IN p_diploma_id INT,
    IN p_file_path VARCHAR(255),
    IN p_number_of_certificates INT,
    OUT p_status_code INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_exists INT;
    
    -- Verificar si existe el diplomado y ya solicitó certificados
    SELECT COUNT(*) INTO v_exists
    FROM diplomas
    WHERE id = p_diploma_id 
      AND certificates_requested = 1
      AND certificates_delivered = 0;
      
    IF v_exists = 0 THEN
        SET p_status_code = 404;
        SET p_message = 'El diplomado no existe, no ha solicitado certificados o ya fueron entregados';
    END IF;
    
    -- Iniciar la transacción
    START TRANSACTION;
    
    -- Insertar el oficio en la tabla diploma_official_letter
    INSERT INTO diploma_official_letter (diploma_id, filePath)
    VALUES (p_diploma_id, p_file_path);
    
    -- Actualizar los participantes con el número de certificados y marcar como entregados
    UPDATE diplomas
    SET participants = p_number_of_certificates,  -- Usar el campo participants para almacenar el número de certificados entregados
        certificates_delivered = 1                -- Marcar como entregados
    WHERE id = p_diploma_id;
    
    COMMIT;
    
    SET p_status_code = 1;
    SET p_message = 'Oficio registrado y certificados marcados como entregados';
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_get_current_vigent_courses()
BEGIN
    SELECT 
        ROW_NUMBER() OVER (ORDER BY c.expiration_date ASC) AS 'ID',
        c.course_name AS 'Nombre del curso',
        DATE_FORMAT(c.created_at, '%d/%m/%Y') AS 'Fecha de registro',
        c.total_duration AS 'Horas',
        c.modality AS 'Modalidad',
        ctr.name AS 'Centro',
        DATE_FORMAT(c.expiration_date, '%d/%m/%Y') AS 'Fecha expiración'
    FROM courses c
    JOIN users u ON c.user_id = u.id
    LEFT JOIN centers ctr ON u.center_id = ctr.id
    WHERE c.expiration_date >= CURRENT_DATE()
      AND c.approval_status = 'approved'
    ORDER BY c.expiration_date ASC;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_get_current_vigent_diplomas()
BEGIN
    SELECT 
        ROW_NUMBER() OVER (ORDER BY d.expiration_date ASC) AS 'ID',
        d.name AS 'Nombre del diplomado',
        DATE_FORMAT(d.created_at, '%d/%m/%Y') AS 'Fecha de registro',  
        d.total_duration AS 'Horas',
        d.modality AS 'Modalidad',
        d.center AS 'Centro',
        DATE_FORMAT(d.expiration_date, '%d/%m/%Y') AS 'Fecha expiración'
    FROM diplomas d
    WHERE d.expiration_date >= CURRENT_DATE()
      AND d.approval_status = 'approved'
    ORDER BY d.expiration_date ASC;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_get_certificates_delivered_sessions()
BEGIN
    SELECT 
        ROW_NUMBER() OVER (ORDER BY cs.created_at DESC) AS 'ID',
        c.course_key AS 'Clave del curso',
        c.course_name AS 'Nombre del curso', 
        cs.period AS 'Periodo',
        cs.number_of_participants AS 'Participantes registrados',
        cs.number_of_certificates AS 'Constancias entregadas',
        cs.cost AS 'Costo',
        DATE_FORMAT(cs.created_at, '%d/%m/%Y') AS 'Fecha de registro',
        ctr.name AS 'Centro',
        IFNULL(scol.filePath, '') AS 'Ruta del oficio'
    FROM course_sessions cs
    JOIN courses c ON cs.course_id = c.id
    JOIN users u ON c.user_id = u.id
    JOIN centers ctr ON u.center_id = ctr.id
    LEFT JOIN session_certificate_official_letter scol ON cs.id = scol.session_id
    WHERE cs.certificates_delivered = 1
    ORDER BY cs.created_at DESC;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_get_certificates_delivered_diplomas()
BEGIN
    SELECT 
        ROW_NUMBER() OVER (ORDER BY d.created_at DESC) AS 'ID',
        d.name AS 'Nombre del diplomado',
        d.diploma_key AS 'Clave',
        d.total_duration AS 'Horas',
        d.modality AS 'Modalidad',
        DATE_FORMAT(d.start_date, '%d/%m/%Y') AS 'Fecha inicio',
        DATE_FORMAT(d.end_date, '%d/%m/%Y') AS 'Fecha fin',
        d.participants AS 'Participantes registrados',
        d.number_of_certificates AS 'Constancias emitidas',
        d.center AS 'Centro',
        IFNULL(dol.filePath, '') AS 'Ruta del oficio'
    FROM diplomas d
    LEFT JOIN diploma_official_letter dol ON d.id = dol.diploma_id
    WHERE d.certificates_delivered = 1
      AND d.status = 'finished'
      AND d.approval_status = 'approved'
    ORDER BY d.created_at DESC;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_insert_message(
    IN p_name VARCHAR(100),
    IN p_email VARCHAR(255),
    IN p_subject VARCHAR(255),
    IN p_message TEXT,
    OUT p_status_code INT,
    OUT p_response_message VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_code = -1;
        SET p_response_message = 'Error al registrar el mensaje';
    END;

    START TRANSACTION;
        INSERT INTO messages (name, email, subject, message)
        VALUES (p_name, p_email, p_subject, p_message);

        SET p_status_code = 1;
        SET p_response_message = 'Mensaje registrado exitosamente';
    COMMIT;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_get_all_messages()
BEGIN
    SELECT 
        m.id,
        m.name,
        m.email,
        m.subject,
        m.message,
        m.sent_at,
        m.attended,
        m.attended_at,
        CONCAT(u.first_name, ' ', u.last_name) as attended_by_name
    FROM messages m
    LEFT JOIN users u ON m.attended_by = u.id
    ORDER BY m.sent_at DESC;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_get_all_instructors()
BEGIN
    -- Datos generales del instructor
    SELECT 
        agi.id, 
        agi.first_name, 
        agi.last_name, 
        agi.second_last_name, 
        agi.email, 
        agi.knowledge_area, 
        c.name AS center_name
    FROM 
        actors_general_information agi
        JOIN centers c ON c.type = agi.center_type AND c.identifier = agi.center_identifier;

    -- Historial académico
    SELECT 
        ah.actor_id, 
        ah.education_level, 
        ah.period, 
        ah.institution, 
        ah.degree_awarded, 
        ah.evidence_path
    FROM 
        academic_history ah;

    -- Experiencia profesional
    SELECT 
        pe.actor_id, 
        pe.period, 
        pe.organization, 
        pe.position, 
        pe.activity, 
        pe.evidence_path
    FROM 
        professional_experience pe;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_manage_template(
    IN p_action VARCHAR(10),      -- 'INSERT' o 'UPDATE'
    IN p_template_id INT,         -- NULL para INSERT
    IN p_type VARCHAR(20),        -- 'course', 'diploma', 'certificate'
    IN p_name VARCHAR(255),
    IN p_file_path VARCHAR(2083),
    IN p_doc_type ENUM('file', 'url'),
    IN p_required BOOLEAN,
    IN p_modalities JSON,         -- Array de modalidades para courses
    OUT p_status_code INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_template_id INT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        SET p_status_code = -1;
        SET p_message = CONCAT('Error: ', SQLERRM);
    END;

    START TRANSACTION;

    CASE p_action
        WHEN 'INSERT' THEN
            CASE p_type
                WHEN 'course' THEN
                    INSERT INTO documents_templates (name, filePath, type)
                    VALUES (p_name, p_file_path, p_doc_type);
                    
                    SET v_template_id = LAST_INSERT_ID();
                    
                    IF p_modalities IS NOT NULL THEN
                        INSERT INTO document_access (document_id, modality, required)
                        SELECT 
                            v_template_id,
                            JSON_UNQUOTE(m.value),
                            p_required
                        FROM JSON_TABLE(
                            p_modalities,
                            '$[*]' COLUMNS (value VARCHAR(20) PATH '$')
                        ) AS m;
                    END IF;

                WHEN 'diploma' THEN
                    INSERT INTO documents_templates_diplomae 
                        (name, filePath, type, required)
                    VALUES 
                        (p_name, p_file_path, p_doc_type, p_required);

                WHEN 'certificate' THEN
                    INSERT INTO certificate_documents_templates 
                        (name, filePath, type, required)
                    VALUES 
                        (p_name, p_file_path, p_doc_type, p_required);
            END CASE;

        WHEN 'UPDATE' THEN
            IF p_template_id IS NULL THEN
                SIGNAL SQLSTATE '45000' 
                SET MESSAGE_TEXT = 'Se requiere template_id para actualizar';
            END IF;

            CASE p_type
                WHEN 'course' THEN
                    UPDATE documents_templates 
                    SET name = p_name,
                        filePath = CASE WHEN p_file_path != '' 
                                      THEN p_file_path 
                                      ELSE filePath END,
                        type = p_doc_type
                    WHERE id = p_template_id;

                    IF p_modalities IS NOT NULL THEN
                        DELETE FROM document_access 
                        WHERE document_id = p_template_id;

                        INSERT INTO document_access (document_id, modality, required)
                        SELECT 
                            p_template_id,
                            JSON_UNQUOTE(m.value),
                            p_required
                        FROM JSON_TABLE(
                            p_modalities,
                            '$[*]' COLUMNS (value VARCHAR(20) PATH '$')
                        ) AS m;
                    END IF;

                WHEN 'diploma' THEN
                    UPDATE documents_templates_diplomae 
                    SET name = p_name,
                        filePath = CASE WHEN p_file_path != '' 
                                      THEN p_file_path 
                                      ELSE filePath END,
                        type = p_doc_type,
                        required = p_required
                    WHERE id = p_template_id;

                WHEN 'certificate' THEN
                    UPDATE certificate_documents_templates 
                    SET name = p_name,
                        filePath = CASE WHEN p_file_path != '' 
                                      THEN p_file_path 
                                      ELSE filePath END,
                        type = p_doc_type,
                        required = p_required
                    WHERE id = p_template_id;
            END CASE;
    END CASE;

    SET p_status_code = 1;
    SET p_message = CASE p_action
        WHEN 'INSERT' THEN 'Plantilla creada exitosamente'
        ELSE 'Plantilla actualizada exitosamente'
    END;

    COMMIT;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_insert_tutorial_video(
    IN p_title VARCHAR(255),
    IN p_description TEXT,
    IN p_video_url VARCHAR(2083),
    IN p_thumbnail_url VARCHAR(2083),
    OUT p_status_code INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        SET p_status_code = -1;
        SET p_message = 'Error al insertar el video tutorial';
        ROLLBACK;
    END;

    START TRANSACTION;
    
    INSERT INTO tutorial_videos (
        title,
        description,
        video_url,
        thumbnail_url
    ) VALUES (
        p_title,
        p_description,
        p_video_url,
        p_thumbnail_url
    );

    SET p_status_code = 1;
    SET p_message = 'Video tutorial insertado correctamente';
    
    COMMIT;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_get_tutorial_videos()
BEGIN
    SELECT 
        id,
        title,
        description,
        video_url as videoUrl,
        thumbnail_url as thumbnailUrl,
        created_at as createdAt
    FROM tutorial_videos
    ORDER BY created_at DESC;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_update_message_status(
    IN p_id INT,
    IN p_attended BOOLEAN,
    IN p_attended_by_username VARCHAR(50),
    OUT p_status_code INT,
    OUT p_response_message VARCHAR(255)
)
BEGIN
    DECLARE v_user_id INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_code = -1;
        SET p_response_message = 'Error al actualizar el mensaje';
    END;

    START TRANSACTION;
        -- Obtener el ID del usuario por su username
        SELECT id INTO v_user_id
        FROM users
        WHERE username = p_attended_by_username;

        IF v_user_id IS NULL THEN
            SET p_status_code = -1;
            SET p_response_message = 'Usuario no encontrado';
            ROLLBACK;
        ELSE
            UPDATE messages
            SET attended = p_attended,
                attended_by = CASE WHEN p_attended = 1 THEN v_user_id ELSE NULL END,
                attended_at = CASE WHEN p_attended = 1 THEN CURRENT_TIMESTAMP ELSE NULL END
            WHERE id = p_id;

            SET p_status_code = 1;
            SET p_response_message = 'Mensaje actualizado exitosamente';
            COMMIT;
        END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_update_diploma_status()
BEGIN
    -- Actualizar el estado de los diplomados basado en la fecha de fin
    UPDATE diplomas
    SET status = 'finished'
    WHERE end_date < CURRENT_DATE 
    AND status = 'ongoing';

    -- Opcional: Retornar el número de diplomados actualizados
    SELECT CONCAT(ROW_COUNT(), ' diplomados han sido actualizados a completed') as result;
END$$
DELIMITER ;

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ EVENTOS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
DELIMITER $$
CREATE EVENT event_update_course_sessions_status
ON SCHEDULE EVERY 1 DAY
STARTS TIMESTAMP(CURRENT_DATE, '19:42:00')  
DO
BEGIN
    SET SQL_SAFE_UPDATES = 0;
    CALL sp_update_course_sessions_status();
    SET SQL_SAFE_UPDATES = 1;
END$$
DELIMITER ;

DELIMITER $$
CREATE EVENT event_update_diploma_status
ON SCHEDULE EVERY 1 DAY
STARTS TIMESTAMP(CURRENT_DATE, '19:42:00')
DO
BEGIN
    SET SQL_SAFE_UPDATES = 0;
    CALL sp_update_diploma_status();
    SET SQL_SAFE_UPDATES = 1;
END$$
DELIMITER ;
-- DROP EVENT IF EXISTS event_update_course_sessions_status;

SET GLOBAL event_scheduler = ON;


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

INSERT INTO documents_templates_diplomae (name, filePath, type, required) VALUES
('Formato de oficio de solicitud', 'assets/diplomae_templates/oficio-de-solicitud.doc', 'file', true),							
('Formato de solicitud de dictamen académico', 'assets/diplomae_templates/solicitud-de-registro-22.doc', 'file', true),
('Formato de potesta de autoría', 'assets/diplomae_templates/protesta-de-autoría.docx', 'file', true),							
('Síntesis del programa del diplomado', 'assets/diplomae_templates/síntesis-del-programa-del-diplomado.doc', 'file', true),
('Cronograma de actividades', 'assets/diplomae_templates/cronograma-de-actividades.doc', 'file', true),
('Currículum Vitae de Instructor y Aval', 'assets/diplomae_templates/formato-cv-instructor.docx', 'file', true),
('Carta Aval', 'assets/diplomae_templates/ejemplo-carta-aval.pdf', 'file', true),
('Lista inicial de participantes', 'assets/diplomae_templates/lista-inicial-de-participantes.doc', 'file', false);

INSERT INTO documents_templates (name, filePath, type) VALUES
('Formato de registro de cursos de formación a lo largo de la vida', 'assets/templates/01 FS20H 2024-2.docx', 'file'),
('Lista de cotejo para formato de registro de cursos', 'assets/templates/01 LC20H 2024-2.xlsx', 'file'),
('Oficio de visto bueno proporcionado por la DEV', 'https://www.ipn.mx/dev/servicios/evaluacion-rdd.html', 'url'),
('Formato de protesta de autoría', 'assets/templates/02 FPA20H 2024.docx', 'file'),
('Carta aval', 'assets/templates/05 CA-ejemplo.pdf', 'file');

INSERT INTO certificate_documents_templates (name, filePath, type, required) VALUES
('Oficio de Solicitud', 'assets/certificate_documents_templates/formato-oficio-de-solicitud.docx', 'file', true),
('Formato de Lista de Calificaciones', 'assets/certificate_documents_templates/lista-final-de-calificaciones.doc', 'file', true),
('Comprobante de Pago', NULL, 'file', true);

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
-- CALL sp_insert_user('director_chihuahua', 'director_chihuahua@example.com', 'pass_chihuahua', 'Carlos', 'Hernández', 'López', 'Centro de Innovación e Integración de Tecnologías Avanzadas Chihuahua', 'user', @status_code, @message);
-- CALL sp_insert_user('director_puebla', 'director_puebla@example.com', 'pass_puebla', 'María', 'García', 'Martínez', 'Centro de Innovación e Integración de Tecnologías Avanzadas Puebla', 'user', @status_code, @message);
-- CALL sp_insert_user('director_veracruz', 'director_veracruz@example.com', 'pass_veracruz', 'Sebastián', 'Morales', 'Palacios', 'Centro de Innovación e Integración de Tecnologías Avanzadas Veracruz', 'user', @status_code, @message);
-- CALL sp_insert_user('director_cajeme', 'director_cajeme@example.com', 'pass_cajeme', 'Ana', 'Martínez', 'Pérez', 'Centro de Vinculación y Desarrollo Regional Unidad Cajeme', 'user', @status_code, @message);
-- CALL sp_insert_user('director_campeche', 'director_campeche@example.com', 'pass_campeche', 'Jorge', 'Díaz', 'Ramírez', 'Centro de Vinculación y Desarrollo Regional Unidad Campeche', 'user', @status_code, @message);
-- CALL sp_insert_user('director_cancun', 'director_cancun@example.com', 'pass_cancun', 'Sofía', 'Jiménez', 'Vargas', 'Centro de Vinculación y Desarrollo Regional Unidad Cancún', 'user', @status_code, @message);
-- CALL sp_insert_user('director_culiacan', 'director_culiacan@example.com', 'pass_culiacan', 'Roberto', 'Torres', 'Morales', 'Centro de Vinculación y Desarrollo Regional Culiacán', 'user', @status_code, @message);
-- CALL sp_insert_user('director_durango', 'director_durango@example.com', 'pass_durango', 'Daniela', 'Sánchez', 'Ortega', 'Centro de Vinculación y Desarrollo Regional Durango', 'user', @status_code, @message);
-- CALL sp_insert_user('director_losmochis', 'director_losmochis@example.com', 'pass_losmochis', 'Ricardo', 'Pérez', 'Castillo', 'Centro de Vinculación y Desarrollo Regional Unidad Los Mochis', 'user', @status_code, @message);
-- CALL sp_insert_user('director_mazatlan', 'director_mazatlan@example.com', 'pass_mazatlan', 'Fernanda', 'Ruiz', 'Gómez', 'Centro de Desarrollo y Vinculación Regional Unidad Mazatlán', 'user', @status_code, @message);
-- CALL sp_insert_user('director_morelia', 'director_morelia@example.com', 'pass_morelia', 'Miguel', 'Hernández', 'Lara', 'Centro de Vinculación y Desarrollo Regional Unidad Morelia', 'user', @status_code, @message);
-- CALL sp_insert_user('director_tlaxcala', 'director_tlaxcala@example.com', 'pass_tlaxcala', 'Valeria', 'Castillo', 'Núñez', 'Centro de Vinculación y Desarrollo Regional Unidad Tlaxcala', 'user', @status_code, @message);
-- CALL sp_insert_user('director_oaxaca', 'director_oaxaca@example.com', 'pass_oaxaca', 'Héctor', 'Cruz', 'Mendoza', 'Centro de Vinculación y Desarrollo Regional Unidad Oaxaca', 'user', @status_code, @message);
-- CALL sp_insert_user('director_tijuana', 'director_tijuana@example.com', 'pass_tijuana', 'Gabriela', 'Flores', 'Ramos', 'Centro de Vinculación y Desarrollo Regional Unidad Tijuana', 'user', @status_code, @message);
CALL sp_insert_user('director_tampico', 'director_tampico@example.com', 'pass_tampico', 'Eduardo', 'Rojas', 'Peña', 'Centro de Vinculación y Desarrollo Regional Unidad Tampico', 'user', @status_code, @message);

-- Insertar el usuario root (sin centro)
CALL sp_insert_user('admin', 'admin@example.com', 'pass_admin', 'Alejandra', 'Delgadillo', 'Martínez', NULL, 'root', @status_code, @message);
select * from  courses;
-- Insertar usuario directora
CALL sp_insert_user('verificador',  'nparram@ipn.mx',  'pass_verificador', 'Nancy Dalia', 'Parra', 'Mejía', NULL, 'verifier',  @status_code, @message);

INSERT INTO tutorial_videos (title, description, video_url, thumbnail_url) VALUES 
(
    'Cómo registrar un nuevo curso',
    'En este tutorial aprenderás el proceso completo de registro de un nuevo curso en la plataforma, desde la información básica hasta la documentación requerida.',
    'https://www.youtube.com/embed/Qu0dIn3_2Zc',
    'https://img.youtube.com/vi/Qu0dIn3_2Zc/maxresdefault.jpg'
);
-- SELECT COUNT(*) FROM courses WHERE YEAR(created_at) = 2025;
-- CALL sp_check_username('admin', @user_exists);
-- SELECT @user_exists;
 -- SELECT * FROM centers;
 -- SELECT * FROM course_sessions;
 -- SELECT * FROM session_certificates_request_documentation;
 -- SELECT * FROM course_schedules;
 
-- SELECT * FROM course_schedules WHERE session_id = 2;

-- SP para reportes
-- CALL sp_get_current_vigent_courses();
-- CALL sp_get_current_vigent_diplomas(); 
-- CALL sp_get_certificates_delivered_sessions();
-- CALL sp_get_certificates_delivered_diplomas();

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
WHERE id = 3;

UPDATE courses
SET status = 'submitted'
WHERE id = 3;
*/
-- truncate table session_certificate_official_letter;
-- UPDATE course_sessions SET certificates_delivered = 0 WHERE id = 1;

/*
UPDATE courses 
SET expiration_date = '2020-01-29' 
WHERE id = 5;*/

/*
UPDATE courses 
SET approval_status = 'pending' 
WHERE id = 2;

UPDATE courses 
SET verification_status = 'pending' 
WHERE id = 2;
*/
/*
UPDATE course_sessions
SET status = 'completed' 
WHERE id = 4;*/

/*
UPDATE course_schedules 
SET date = '2025-01-29' 
WHERE id = 15;*/

/*
UPDATE diplomas 
SET approval_status = 'approved' 
WHERE id = 1;
select *from diploma_actor_roles;
*/

/*
UPDATE diplomas 
SET certificates_requested = 1
WHERE id = 1;
select *from diploma_actor_roles;
*/
-- update course_sessions set status = 'opened' where id = 4;
-- DROP DATABASE dvdr_cursos;