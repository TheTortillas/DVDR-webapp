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

CREATE TABLE documents_templates_diploma (
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
  FOREIGN KEY (document_id) REFERENCES documents_templates_diploma(id) ON DELETE CASCADE
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