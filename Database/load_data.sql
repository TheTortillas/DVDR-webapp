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

-- Insertar centros con información de directores 
CALL sp_add_center('Centro de Innovación e Integración de Tecnologías Avanzadas Chihuahua', 'CITTA', 2, 'Roberto Sánchez Méndez', 'Dr.', 'H', @status_code, @message);
CALL sp_add_center('Centro de Innovación e Integración de Tecnologías Avanzadas Puebla', 'CITTA', 3, 'María Elena Vázquez Torres', 'Dra.', 'M', @status_code, @message);
CALL sp_add_center('Centro de Innovación e Integración de Tecnologías Avanzadas Veracruz', 'CITTA', 1, 'Javier Ramírez Hernández', 'Dr.', 'H', @status_code, @message);
CALL sp_add_center('Centro de Vinculación y Desarrollo Regional Unidad Cajeme', 'CVDR', 1, 'Patricia González Rodríguez', 'M.C.', 'M', @status_code, @message);
CALL sp_add_center('Centro de Vinculación y Desarrollo Regional Unidad Campeche', 'CVDR', 2, 'Carlos Alberto Martínez Ruiz', 'Dr.', 'H', @status_code, @message);
CALL sp_add_center('Centro de Vinculación y Desarrollo Regional Unidad Cancún', 'CVDR', 3, 'Sofía Ortega Jiménez', 'Dra.', 'M', @status_code, @message);
CALL sp_add_center('Centro de Vinculación y Desarrollo Regional Culiacán', 'CVDR', 4, 'Fernando López Castillo', 'M.I.', 'H', @status_code, @message);
CALL sp_add_center('Centro de Vinculación y Desarrollo Regional Durango', 'CVDR', 5, 'Miguel Ángel Torres Vega', 'Ing.', 'H', @status_code, @message);
CALL sp_add_center('Centro de Vinculación y Desarrollo Regional Unidad Los Mochis', 'CVDR', 6, 'Laura Estrada Guzmán', 'M.A.', 'M', @status_code, @message);
CALL sp_add_center('Centro de Desarrollo y Vinculación Regional Unidad Mazatlán', 'CVDR', 7, 'Héctor Ramírez Soto', 'Dr.', 'H', @status_code, @message);
CALL sp_add_center('Centro de Vinculación y Desarrollo Regional Unidad Morelia', 'CVDR', 8, 'Verónica Villaseñor López', 'Dra.', 'M', @status_code, @message);
CALL sp_add_center('Centro de Vinculación y Desarrollo Regional Unidad Tlaxcala', 'CVDR', 12, 'Eduardo Delgado Méndez', 'M.C.', 'H', @status_code, @message);
CALL sp_add_center('Centro de Vinculación y Desarrollo Regional Unidad Oaxaca', 'CVDR', 9, 'Gabriela Herrera Campos', 'Dra.', 'M', @status_code, @message);
CALL sp_add_center('Centro de Vinculación y Desarrollo Regional Unidad Tijuana', 'CVDR', 11, 'Alejandro Navarro Peña', 'Dr.', 'H', @status_code, @message);
CALL sp_add_center('Centro de Vinculación y Desarrollo Regional Unidad Tampico', 'CVDR', 10, 'Carmen Rojas Valencia', 'M.I.', 'M', @status_code, @message);

INSERT INTO documents_templates_diploma (name, filePath, type, required) VALUES
('Formato de oficio de solicitud', 'assets/diploma_templates/oficio-de-solicitud.doc', 'file', true),							
('Formato de solicitud de dictamen académico', 'assets/diploma_templates/solicitud-de-registro-22.doc', 'file', true),
('Formato de potesta de autoría', 'assets/diploma_templates/protesta-de-autoría.docx', 'file', true),							
('Síntesis del programa del diplomado', 'assets/diploma_templates/síntesis-del-programa-del-diplomado.doc', 'file', true),
('Cronograma de actividades', 'assets/diploma_templates/cronograma-de-actividades.doc', 'file', true),
('Currículum Vitae de Instructor y Aval', 'assets/diploma_templates/formato-cv-instructor.docx', 'file', true),
('Carta Aval', 'assets/diploma_templates/ejemplo-carta-aval.pdf', 'file', true),
('Lista inicial de participantes', 'assets/diploma_templates/lista-inicial-de-participantes.doc', 'file', true);

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

-- Insertar el usuario root (sin centro)
CALL sp_insert_user('admin', 'admin@example.com', 'pass_admin', 'Alejandra', 'Delgadillo', 'Martínez', NULL, 'root', @status_code, @message);
-- Insertar usuario directora
CALL sp_insert_user('verificador',  'nparram@ipn.mx',  'pass_verificador', 'Nancy Dalia', 'Parra', 'Mejía', NULL, 'verifier',  @status_code, @message);

INSERT INTO tutorial_videos (title, description, video_url, thumbnail_url) VALUES 
(
    'Cómo registrar un nuevo curso',
    'En este tutorial aprenderás el proceso completo de registro de un nuevo curso en la plataforma, desde la información básica hasta la documentación requerida.',
    'https://www.youtube.com/embed/Qu0dIn3_2Zc',
    'https://img.youtube.com/vi/Qu0dIn3_2Zc/maxresdefault.jpg'
);