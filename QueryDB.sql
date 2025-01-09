CREATE DATABASE dvdr_cursos;
USE dvdr_cursos;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,  
    last_name VARCHAR(100) NOT NULL,  
    second_last_name VARCHAR(100),     
    center VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_name VARCHAR(255) NOT NULL,	-- nombre
    service_type VARCHAR(255) NOT NULL, -- curso, diplomado u otro
    category VARCHAR(255) NOT NULL, 	-- matematicas, medico biologicas, ...
    agreement VARCHAR(255), 			-- convenio (opcional)
    total_duration INT NOT NULL,		-- duración total en horas
    modality VARCHAR(255) NOT NULL,		-- escolarizada, no escolarizada, mixta
    educational_offer VARCHAR(255) NOT NULL, -- medio, superior, posgrado
    educational_platform VARCHAR(255) NOT NULL,	-- zoom, meet, teams ...
	course_key VARCHAR(50) UNIQUE NOT NULL, -- Clave única para el curso
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
	user_id INT NOT NULL, -- Relación con usuarios
    FOREIGN KEY (user_id) REFERENCES users(id) 
		ON DELETE CASCADE
);

CREATE TABLE course_documentation (
    id INT PRIMARY KEY AUTO_INCREMENT,
    formato_registro_cursos LONGBLOB,
    lista_cotejo_registro_cursos LONGBLOB,
    lista_cotejo_modalidad_no_escolarizada LONGBLOB,
    formato_protesta_autoria LONGBLOB,
    cronograma_actividades LONGBLOB,
    formato_curriculum_vitae LONGBLOB,
    carta_aval LONGBLOB,
    
    course_id INT NOT NULL, -- Relación con cursos
    FOREIGN KEY (course_id) REFERENCES courses(id) 
		ON DELETE CASCADE
);

-- Tabla principal: Información general del Actor
CREATE TABLE actors_general_information (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    second_last_name VARCHAR(255) NOT NULL,
    street VARCHAR(255) NOT NULL,
    house_number VARCHAR(255) NOT NULL,
    neighborhood VARCHAR(255) NOT NULL,
    postal_code VARCHAR(5) NOT NULL,
    city_or_district VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    landline_phone VARCHAR(15) NOT NULL,
    mobile_phone VARCHAR(15) NOT NULL,
	center VARCHAR(100) NOT NULL -- EL centro que dió de alta al autor
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
    course_subkey VARCHAR(255) NOT NULL, -- Sublcave del curso
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
		SET hashed_password = SHA2(p_password, 256);

		INSERT INTO users (username, password, first_name, last_name, second_last_name, center)
		VALUES (p_username, hashed_password, p_first_name, p_last_name, p_second_last_name, p_center);
		
		SELECT 1 AS status_code, 'Éxito: Usuario insertado correctamente.' AS mensaje;
    COMMIT;
END$$
DELIMITER ;

-- Procedimiento para verificar si el usuario y contraseña son correctos
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

    START TRANSACTION;
        SELECT password, center INTO stored_password, user_center
        FROM users
        WHERE username = p_username;

        IF stored_password IS NULL THEN
            SET p_is_valid = FALSE;
        ELSE
            IF SHA2(p_password, 256) = stored_password THEN
                SET p_is_valid = TRUE;
                SET p_user_center = user_center;
            ELSE
                SET p_is_valid = FALSE;
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


-- Ejemplo de cómo insertar un nuevo usuario con los nuevos campos
CALL sp_insert_user('admin', 'Aguacate.20', 'Sebastián', 'Morales', 'Palacios', 'Centro de Innovación e Integración de Tecnologías Avanzadas Veracruz');

-- Llamar al procedimiento para verificar usuario y contraseña
CALL sp_verify_user('admin', 'Aguacate.20', @is_valid);
SELECT @is_valid;

CALL sp_check_username('admin', @user_exists);
SELECT @user_exists;

SELECT * FROM academic_categories;

CREATE TABLE academic_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);
INSERT INTO academic_categories (name) VALUES
('Ingeniería y Ciencias Físico-Matemáticas'),
('Ciencias Médico Biológicas'),
('Ciencias Sociales y Administrativas'),
('Desarrollo Humano'),
('Idiomas'),
('Multidisciplinarios'),
('Educación'),
('TIC');

CREATE TABLE centers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('CITTA', 'DVDR') NOT NULL
);
INSERT INTO centers (name, type) VALUES
('Centro de Vinculación y Desarrollo Regional Unidad Tampico', 'DVDR'),
('Centro de Vinculación y Desarrollo Regional Culiacán', 'DVDR'),
('Centro de Vinculación y Desarrollo Regional Unidad Cajeme', 'DVDR'),
('Centro de Vinculación y Desarrollo Regional Unidad Cancún', 'DVDR'),
('Centro de Vinculación y Desarrollo Regional Unidad Campeche', 'DVDR'),
('Centro de Vinculación y Desarrollo Regional Durango', 'DVDR'),
('Centro de Vinculación y Desarrollo Regional Unidad Los Mochis', 'DVDR'),
('Centro de Desarrollo y Vinculación Regional Unidad Mazatlán', 'DVDR'),
('Centro de Vinculación y Desarrollo Regional Unidad Morelia', 'DVDR'),
('Centro de Vinculación y Desarrollo Regional Unidad Tlaxcala', 'DVDR'),
('Centro de Vinculación y Desarrollo Regional Unidad Oaxaca', 'DVDR'),
('Centro de Vinculación y Desarrollo Regional Unidad Tijuana', 'DVDR');
INSERT INTO centers (name, type) VALUES
('Centro de Innovación e Integración de Tecnologías Avanzadas Chihuahua', 'CITTA'),
('Centro de Innovación e Integración de Tecnologías Avanzadas Puebla', 'CITTA'),
('Centro de Innovación e Integración de Tecnologías Avanzadas Veracruz', 'CITTA');

SELECT * FROM users;

 -- DROP DATABASE dvdr_cursos;
 -- TRUNCATE TABLE academic_categories;

-- ################################################################################################################################### 
-- Crear la tabla Curso
CREATE TABLE Curso (
    id_curso INT PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE,
    tipo_de_servicio VARCHAR(50),
    categoria VARCHAR(50),
    convenio VARCHAR(50),
    unidad_responsable_del_servicio VARCHAR(100),
    duracion INT NOT NULL,
    escolaridad VARCHAR(100),
    oferta_educativa VARCHAR(255),
    sede VARCHAR(255),
    plataforma_educativa VARCHAR(255),
    costo_unitario DECIMAL(10, 2),
    num_de_inscritos INT
);

-- Crear la tabla Instructor
CREATE TABLE Instructor (
    ID_instructor INT PRIMARY KEY,
    primer_apellido VARCHAR(255),
    segundo_apellido VARCHAR(255),
    nombres VARCHAR(255),
    calle VARCHAR(255),
    numero VARCHAR(10),
    colonia VARCHAR(255),
    cp CHAR(5),
    municipio_estado VARCHAR(255),
    estado VARCHAR(255),
    correo_electronico VARCHAR(255) UNIQUE,
    telefono_particular VARCHAR(20),
    telefono_celular VARCHAR(20)
);

-- Crear la tabla Cronograma_calendario
CREATE TABLE Cronograma_calendario (
    ID_cronograma_calendario INT PRIMARY KEY,
    fecha DATE,
    hora_inicio TIME,
    hora_fin TIME
);

-- Crear la tabla Cronograma_curso
CREATE TABLE Cronograma_curso (
    ID_curso INT,
    ID_cronograma_calendario INT,
    horas_totales DECIMAL(5, 2),
    fecha_inicio DATE,
    fecha_fin DATE,
    PRIMARY KEY (ID_curso, ID_cronograma_calendario),
    FOREIGN KEY (ID_curso) REFERENCES Curso(ID_curso),
    FOREIGN KEY (ID_cronograma_calendario) REFERENCES Cronograma_calendario(ID_cronograma_calendario)
);

-- Crear la tabla Instructores_curso
CREATE TABLE Instructores_curso (
    ID_instructor INT,
    ID_curso INT,
    rol VARCHAR(255),
    PRIMARY KEY (ID_instructor, ID_curso),
    FOREIGN KEY (ID_instructor) REFERENCES Instructor(ID_instructor),
    FOREIGN KEY (ID_curso) REFERENCES Curso(ID_curso)
);

-- Crear la tabla Educacion
CREATE TABLE Educacion (
    ID_formacion_academica INT PRIMARY KEY,
    nivel_escolar VARCHAR(255),
    periodo VARCHAR(255),
    institucion VARCHAR(255),
    titulo_otorgado VARCHAR(255),
    evidencia LONGBLOB
);

-- Crear la tabla Experiencia
CREATE TABLE Experiencia (
    ID_experiencia INT PRIMARY KEY,
    desde DATE,
    hasta DATE,
    organizacion VARCHAR(255),
    puesto VARCHAR(255),
    actividad VARCHAR(255),
    evidencia LONGBLOB
);

-- Crear la tabla Instructores_data
CREATE TABLE Instructores_data (
    ID_instructor INT,
    ID_experiencia INT,
    ID_formacion_academica INT,
    PRIMARY KEY (ID_instructor, ID_experiencia, ID_formacion_academica),
    FOREIGN KEY (ID_instructor) REFERENCES Instructor(ID_instructor),
    FOREIGN KEY (ID_experiencia) REFERENCES Experiencia(ID_experiencia),
    FOREIGN KEY (ID_formacion_academica) REFERENCES Educacion(ID_formacion_academica)
);

DROP DATABASE dvdr_cursos;
