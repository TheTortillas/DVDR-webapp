﻿using DVDR_courses.DTOs;
using DVDR_courses.DTOs.Auth;
using DVDR_courses.DTOs.Data;
using DVDR_courses.DTOs.Instructor;
using DVDR_courses.DTOs.Messages;
using DVDR_courses.DTOs.Reports;
using DVDR_courses.Services;
using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using System.Data;
namespace DVDR_courses
{
    public class DBManager
    {
        private readonly IConfiguration _config;
        // Constructor
        public DBManager(IConfiguration config)
        {
            _config = config;
        }

        // Método para dar de alta un usuario
        //public int sign_up(string p_username, string p_password, string p_first_name, string p_last_name, string p_second_last_name, string p_center)
        //{
        //    var result = 0;

        //    // Validar campos obligatorios
        //    if (string.IsNullOrWhiteSpace(p_username) || string.IsNullOrWhiteSpace(p_password) ||
        //        string.IsNullOrWhiteSpace(p_first_name) || string.IsNullOrWhiteSpace(p_last_name) ||
        //        string.IsNullOrWhiteSpace(p_center))
        //    {
        //        return result = -1; // Campos obligatorios err 400
        //    }

        //    try
        //    {
        //        using (MySqlConnection con = new MySqlConnection(_config.GetConnectionString("default")))
        //        {
        //            con.Open();

        //            // Verificar si el usuario ya existe usando el procedimiento almacenado `sp_check_username`
        //            using (MySqlCommand checkCommand = new MySqlCommand("sp_check_username", con))
        //            {
        //                checkCommand.CommandType = System.Data.CommandType.StoredProcedure;
        //                checkCommand.Parameters.Add(new MySqlParameter("p_username", p_username));
        //                var existsParam = new MySqlParameter("p_exists", MySqlDbType.Bit)
        //                {
        //                    Direction = System.Data.ParameterDirection.Output
        //                };
        //                checkCommand.Parameters.Add(existsParam);

        //                checkCommand.ExecuteNonQuery();

        //                bool userExists = Convert.ToBoolean(existsParam.Value);
        //                if (userExists)
        //                {
        //                    return result = -2; // Usuario ya existe err 400
        //                }
        //            }

        //            // Si el usuario no existe, proceder a insertarlo con `sp_insert_user`
        //            using (MySqlCommand insertCommand = new MySqlCommand("sp_insert_user", con))
        //            {
        //                insertCommand.CommandType = System.Data.CommandType.StoredProcedure;

        //                // Agregar parámetros
        //                insertCommand.Parameters.Add(new MySqlParameter("p_username", p_username));
        //                insertCommand.Parameters.Add(new MySqlParameter("p_password", p_password));
        //                insertCommand.Parameters.Add(new MySqlParameter("p_first_name", p_first_name));
        //                insertCommand.Parameters.Add(new MySqlParameter("p_last_name", p_last_name));
        //                insertCommand.Parameters.Add(new MySqlParameter("p_second_last_name", string.IsNullOrEmpty(p_second_last_name) ? DBNull.Value : p_second_last_name));
        //                insertCommand.Parameters.Add(new MySqlParameter("p_center", p_center));

        //                // Leer los resultados devueltos por el procedimiento almacenado
        //                using (MySqlDataReader reader = insertCommand.ExecuteReader())
        //                {
        //                    if (reader.Read()) // Si hay resultados
        //                    {
        //                        result.StatusCode = reader.GetInt32("status_code") == 1 ? 201 : 500; // 201 Created o 500 Internal Server Error
        //                        result.Message = reader.GetString("mensaje");
        //                    }
        //                }
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        // Manejo de excepciones no controladas
        //        Console.WriteLine($"Error: {ex.Message}");
        //        result.StatusCode = 500; // Código HTTP: Internal Server Error
        //        result.Message = "Error: Se produjo un error inesperado.";
        //    }

        //    return result;
        //}

        // Metodo para iniciar sesión
        public object sign_in(string p_username, string p_password)
        {
            try
            {
                using (MySqlConnection con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    MySqlCommand mySqlCommand = new MySqlCommand("sp_verify_user", con);
                    mySqlCommand.CommandType = System.Data.CommandType.StoredProcedure;

                    // Parámetros de entrada
                    mySqlCommand.Parameters.Add(new MySqlParameter("p_username", p_username));
                    mySqlCommand.Parameters.Add(new MySqlParameter("p_password", p_password));

                    // Parámetro de salida: validación de usuario
                    MySqlParameter isValidParam = new MySqlParameter("p_is_valid", MySqlDbType.Bit)
                    {
                        Direction = System.Data.ParameterDirection.Output
                    };
                    mySqlCommand.Parameters.Add(isValidParam);

                    // Parámetro de salida: nombre del centro (puede ser NULL para root)
                    MySqlParameter userCenterParam = new MySqlParameter("p_user_center", MySqlDbType.VarChar, 100)
                    {
                        Direction = System.Data.ParameterDirection.Output
                    };
                    mySqlCommand.Parameters.Add(userCenterParam);

                    // Nuevo parámetro de salida: rol del usuario
                    MySqlParameter userRoleParam = new MySqlParameter("p_user_role", MySqlDbType.VarChar, 10)
                    {
                        Direction = System.Data.ParameterDirection.Output
                    };
                    mySqlCommand.Parameters.Add(userRoleParam);

                    con.Open();
                    mySqlCommand.ExecuteNonQuery();

                    bool isValid = Convert.ToBoolean(isValidParam.Value);
                    string userCenter = userCenterParam.Value?.ToString();
                    string userRole = userRoleParam.Value?.ToString(); // Obtiene el rol del usuario

                    if (isValid)
                    {
                        var jwtService = new JwtService(_config);
                        var user = new User
                        {
                            username = p_username,
                            role = userRole,
                            center = userCenter
                        };
                        string token = jwtService.CreateToken(user);

                        return new AuthResponse { Token = token };
                    }

                    return null;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return null;
            }
        }

        public List<string> get_academic_categories()
        {
            List<string> categories = new List<string>();
            try
            {
                using (MySqlConnection con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    MySqlCommand mySqlCommand = new MySqlCommand("SELECT name FROM academic_categories", con);
                    con.Open();
                    using (MySqlDataReader reader = mySqlCommand.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            categories.Add(reader.GetString("name"));
                        }
                    }
                    if (con.State == System.Data.ConnectionState.Open)
                    {
                        con.Close();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
            return categories;
        }


        public List<DocumentTemplate> GetDocumentTemplates(string modality)
        {
            var templates = new List<DocumentTemplate>();
            try
            {
                using (MySqlConnection con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    string query = @"
                    SELECT dt.id, dt.name, dt.filePath, dt.type, da.required
                    FROM documents_templates dt
                    INNER JOIN document_access da ON dt.id = da.document_id
                    WHERE da.modality = @modality
                    ORDER BY dt.id"; // Ordena por la columna "id"

                    MySqlCommand command = new MySqlCommand(query, con);
                    command.Parameters.AddWithValue("@modality", modality);

                    con.Open();
                    using (MySqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            templates.Add(new DocumentTemplate
                            {
                                Id = reader.GetInt32("id"),
                                Name = reader.GetString("name"),
                                FilePath = reader.GetString("filePath"),
                                Type = reader.GetString("type"),
                                Required = reader.GetBoolean("required") // Lee el campo 'required'
                            });
                        }
                    }

                    if (con.State == System.Data.ConnectionState.Open)
                    {
                        con.Close();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
            return templates;
        }

        public List<DocumentTemplate> GetDiplomaDocumentTemplates()
        {
            var templates = new List<DocumentTemplate>();
            try
            {
                using (MySqlConnection con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    string query = @"
                SELECT id, name, filePath, type, required
                FROM documents_templates_diploma
                ORDER BY id";

                    MySqlCommand command = new MySqlCommand(query, con);
                    con.Open();

                    using (MySqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            templates.Add(new DocumentTemplate
                            {
                                Id = reader.GetInt32("id"),
                                Name = reader.GetString("name"),
                                FilePath = reader.GetString("filePath"),
                                Type = reader.GetString("type"),
                                Required = reader.GetBoolean("required")
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
            return templates;
        }

        public List<DocumentTemplate> GetCertificateDocumentTemplates()
        {
            var templates = new List<DocumentTemplate>();
            try
            {
                using (MySqlConnection con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    string query = @"
                SELECT id, name, filePath, type, required
                FROM certificate_documents_templates
                ORDER BY id";

                    MySqlCommand command = new MySqlCommand(query, con);
                    con.Open();

                    using (MySqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            templates.Add(new DocumentTemplate
                            {
                                Id = reader.GetInt32("id"),
                                Name = reader.GetString("name"),
                                FilePath = reader.IsDBNull(reader.GetOrdinal("filePath")) ? null : reader.GetString("filePath"),
                                Type = reader.GetString("type"),
                                Required = reader.GetBoolean("required")
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
            return templates;
        }

        public (int statusCode, string message) RegisterInstructorAll(InstructorRegister request)
        {
            try
            {
                using (MySqlConnection con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    MySqlCommand cmd = new MySqlCommand("sp_register_instructor_all", con);
                    cmd.CommandType = CommandType.StoredProcedure;

                    // Información general del instructor
                    var generalInfo = request.GeneralInfo;
                    cmd.Parameters.AddWithValue("p_first_name", generalInfo.FirstName);
                    cmd.Parameters.AddWithValue("p_last_name", generalInfo.LastName);
                    cmd.Parameters.AddWithValue("p_second_last_name", generalInfo.SecondLastName);
                    cmd.Parameters.AddWithValue("p_street", generalInfo.Street);
                    cmd.Parameters.AddWithValue("p_house_number", generalInfo.Number);
                    cmd.Parameters.AddWithValue("p_neighborhood", generalInfo.Colony);
                    cmd.Parameters.AddWithValue("p_postal_code", generalInfo.PostalCode);
                    cmd.Parameters.AddWithValue("p_municipality", generalInfo.City);
                    cmd.Parameters.AddWithValue("p_state", generalInfo.State);
                    cmd.Parameters.AddWithValue("p_email", generalInfo.Email);
                    cmd.Parameters.AddWithValue("p_landline_phone", generalInfo.Phone);
                    cmd.Parameters.AddWithValue("p_mobile_phone", generalInfo.Mobile);
                    cmd.Parameters.AddWithValue("p_knowledge_area", string.Join(",", generalInfo.ExpertiseAreas));
                    cmd.Parameters.AddWithValue("p_center_name", generalInfo.Center);

                    // Generar rutas de evidencia usando rutas relativas consistentes
                    var academicHistoriesJson = JsonConvert.SerializeObject(request.AcademicHistories.Select(x => new
                    {
                        x.education_level,
                        x.period,
                        x.institution,
                        x.degree_awarded,
                        evidence_path = Path.Combine(
                            "assets",
                            "files",
                            "instructors-documentation",
                            request.FolderName,
                            "academic-history",
                            x.Evidence.FileName)
                    }));

                    var workExperiencesJson = JsonConvert.SerializeObject(request.WorkExperiences.Select(x => new
                    {
                        x.period,
                        x.organization,
                        x.position,
                        x.activity,
                        evidence_path = Path.Combine(
                            "assets",
                            "files",
                            "instructors-documentation",
                            request.FolderName,
                            "work-experience",
                            x.Evidence.FileName)
                    }));

                    cmd.Parameters.AddWithValue("p_academic_history", academicHistoriesJson);
                    cmd.Parameters.AddWithValue("p_professional_experience", workExperiencesJson);

                    // Parámetros de salida
                    MySqlParameter statusCodeParam = new MySqlParameter("p_status_code", MySqlDbType.Int32)
                    {
                        Direction = ParameterDirection.Output
                    };
                    cmd.Parameters.Add(statusCodeParam);

                    MySqlParameter messageParam = new MySqlParameter("p_message", MySqlDbType.VarChar, 255)
                    {
                        Direction = ParameterDirection.Output
                    };
                    cmd.Parameters.Add(messageParam);

                    con.Open();
                    cmd.ExecuteNonQuery();

                    int statusCode = Convert.ToInt32(statusCodeParam.Value);
                    string message = messageParam.Value.ToString();

                    return (statusCode, message);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return (-1, "Error interno del servidor.");
            }
        }


        public List<InstructorDTO> GetInstructors()
        {
            var instructors = new List<InstructorDTO>();
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    string query = @"
                SELECT 
                    id, 
                    CONCAT(first_name, ' ', last_name, ' ', second_last_name) AS nombre, 
                    knowledge_area 
                FROM actors_general_information";

                    using (var cmd = new MySqlCommand(query, con))
                    {
                        con.Open();
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                instructors.Add(new InstructorDTO
                                {
                                    Id = reader.GetInt32("id"),
                                    Nombre = reader.GetString("nombre"),
                                    AreasExpertise = reader.GetString("knowledge_area").Split(',').ToList()
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }

            return instructors;
        }

        public (int statusCode, string message) RegisterCourseAll(CourseRegister request, string username)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();

                    // Obtener el center_id del usuario
                    var getUserCenterCmd = new MySqlCommand("SELECT center_id FROM users WHERE username = @username", con);
                    getUserCenterCmd.Parameters.AddWithValue("@username", username);
                    var centerId = Convert.ToInt32(getUserCenterCmd.ExecuteScalar());

                    // Obtener el type y identifier del centro
                    var getCenterInfoCmd = new MySqlCommand("SELECT type, identifier FROM centers WHERE id = @centerId", con);
                    getCenterInfoCmd.Parameters.AddWithValue("@centerId", centerId);
                    using (var reader = getCenterInfoCmd.ExecuteReader())
                    {
                        if (!reader.Read())
                        {
                            return (-1, "Centro no encontrado.");
                        }

                        var centerType = reader.GetString("type");
                        var centerIdentifier = reader.GetInt32("identifier").ToString("D2"); // Rellenar con ceros a la izquierda

                        reader.Close(); // Cerrar el DataReader antes de ejecutar la siguiente consulta

                        var currentDate = DateTime.Now;  // Obtener la fecha actual
                        var expirationDate = currentDate.AddYears(2); // Sumar 2 años a la fecha actual

                        int renewalCount = 0;
                        int? parentCourseId = request.ParentCourseId;

                        //string courseKey;
                        //if (parentCourseId == null)
                        //{
                        //    // **CASO: NUEVO CURSO**
                        //    var maxCourseNumberCmd = new MySqlCommand(@"
                        //        SELECT MAX(CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(course_key, '/', -2), '_', 1) AS UNSIGNED))
                        //        FROM courses
                        //        WHERE YEAR(created_at) = @currentYear", con);

                        //    maxCourseNumberCmd.Parameters.AddWithValue("@currentYear", currentDate.Year);

                        //    var maxCourseNumber = maxCourseNumberCmd.ExecuteScalar();
                        //    int nextCourseNumber = (maxCourseNumber == DBNull.Value) ? 1 : Convert.ToInt32(maxCourseNumber) + 1;

                        //    var courseCount = nextCourseNumber.ToString("D3");  // Convertir a formato 3 dígitos


                        //    // Generar course_key normal
                        //    var vigencia = $"{currentDate.Year}-{currentDate.Year + 2}";
                        //    courseKey = $"DVDR/{centerType}/{centerIdentifier}/{courseCount}/{vigencia}";
                        //}
                        //else
                        //{
                        //    // **CASO: RENOVACIÓN**
                        //    var getParentCourseCmd = new MySqlCommand("SELECT course_key, renewal_count FROM courses WHERE id = @parentCourseId", con);
                        //    getParentCourseCmd.Parameters.AddWithValue("@parentCourseId", parentCourseId);
                        //    using (var parentReader = getParentCourseCmd.ExecuteReader())
                        //    {
                        //        if (!parentReader.Read())
                        //        {
                        //            return (-3, "Curso a renovar no encontrado.");
                        //        }

                        //        var parentCourseKey = parentReader.GetString("course_key");
                        //        renewalCount = parentReader.GetInt32("renewal_count") + 1;
                        //    }

                        //    // Obtener el nuevo número de curso en el año
                        //    var countCoursesCmd = new MySqlCommand("SELECT COUNT(*) FROM courses WHERE YEAR(created_at) = @currentYear", con);
                        //    countCoursesCmd.Parameters.AddWithValue("@currentYear", currentDate.Year);
                        //    var courseCount = (Convert.ToInt32(countCoursesCmd.ExecuteScalar()) + 1).ToString("D3");

                        //    // Generar nueva course_key
                        //    var vigencia = $"{currentDate.Year}-{currentDate.Year + 2}";
                        //    courseKey = $"DVDR/{centerType}/{centerIdentifier}/{courseCount}_{renewalCount}/{vigencia}";
                        //}

                        // Llamar al procedimiento almacenado
                        var cmd = new MySqlCommand("sp_register_course", con)
                        {
                            CommandType = CommandType.StoredProcedure
                        };

                        var courseInfo = request.CourseInfo;
                        cmd.Parameters.AddWithValue("p_course_name", courseInfo.CourseName);
                        cmd.Parameters.AddWithValue("p_service_type", courseInfo.ServiceType);
                        cmd.Parameters.AddWithValue("p_category", courseInfo.Category);
                        cmd.Parameters.AddWithValue("p_agreement", string.IsNullOrEmpty(courseInfo.Agreement) ? DBNull.Value : courseInfo.Agreement);
                        cmd.Parameters.AddWithValue("p_total_duration", courseInfo.TotalDuration);
                        cmd.Parameters.AddWithValue("p_modality", courseInfo.Modality);
                        cmd.Parameters.AddWithValue("p_educational_offer", courseInfo.EducationalOffer);
                        cmd.Parameters.AddWithValue("p_educational_platform", string.Join(",", courseInfo.EducationalPlatform ?? new List<string>()));
                        cmd.Parameters.AddWithValue("p_other_educationals_platforms", string.IsNullOrEmpty(courseInfo.CustomPlatform) ? DBNull.Value : courseInfo.CustomPlatform);
                        cmd.Parameters.AddWithValue("p_course_key", DBNull.Value);
                        cmd.Parameters.AddWithValue("p_username", username);
                        cmd.Parameters.AddWithValue("p_documentation_folder", request.FolderName);
                        cmd.Parameters.AddWithValue("p_expiration_date", DBNull.Value);
                        cmd.Parameters.AddWithValue("p_renewal_count", renewalCount);
                        cmd.Parameters.AddWithValue("p_parent_course_id", parentCourseId ?? (object)DBNull.Value);

                        var documentationJson = JsonConvert.SerializeObject(request.Documents.Select(d => new
                        {
                            DocumentID = d.DocumentId,
                            FilePath = Path.Combine(
                                "assets",
                                "files",
                                "courses-documentation",
                                request.FolderName,
                                d.File.FileName
                            )
                        }));
                        cmd.Parameters.AddWithValue("p_documentation", documentationJson);

                        var actorRolesJson = JsonConvert.SerializeObject(courseInfo.Actors.Select(a => new
                        {
                            actor_id = a.Id,
                            role = a.Role
                        }));
                        cmd.Parameters.AddWithValue("p_actor_roles", actorRolesJson);

                        var statusCodeParam = new MySqlParameter("p_status_code", MySqlDbType.Int32) { Direction = ParameterDirection.Output };
                        var messageParam = new MySqlParameter("p_message", MySqlDbType.VarChar, 255) { Direction = ParameterDirection.Output };
                        cmd.Parameters.Add(statusCodeParam);
                        cmd.Parameters.Add(messageParam);

                        cmd.ExecuteNonQuery();

                        int statusCode = Convert.ToInt32(statusCodeParam.Value);
                        string message = messageParam.Value.ToString();

                        return (statusCode, message);
                    }
                }
            }
            catch (Exception ex)
            {
                return (-1, "Error interno del servidor.");
            }
        }


        public List<CourseDTO> GetCoursesByUser(string username)
        {
            using (var con = new MySqlConnection(_config.GetConnectionString("default")))
            {
                var cmd = new MySqlCommand(@"
            SELECT 
                c.id, 
                c.course_name AS Title, 
                c.course_key AS Clave,
                c.status AS Status,
                c.approval_status AS ApprovalStatus,
                c.verification_status AS VerificationStatus,
                c.total_duration AS TotalDuration,
                c.expiration_date AS ExpirationDate,
                c.is_renewed AS IsRenewed
            FROM courses c
            INNER JOIN users u ON c.user_id = u.id
            INNER JOIN centers ct ON u.center_id = ct.id
            WHERE u.center_id = (SELECT center_id FROM users WHERE username = @username LIMIT 1)
        ", con);

                // Usamos el parámetro para asegurarnos de filtrar por el nombre de usuario
                cmd.Parameters.AddWithValue("@username", username);

                con.Open();
                var reader = cmd.ExecuteReader();

                var courses = new List<CourseDTO>();
                while (reader.Read())
                {
                    courses.Add(new CourseDTO
                    {
                        Id = reader.GetInt32("id"),
                        Title = reader.GetString("Title"),
                        Clave = reader.IsDBNull("Clave") ? null : reader.GetString("Clave"),
                        Status = reader.GetString("Status"),
                        ApprovalStatus = reader.GetString("ApprovalStatus"),
                        VerificationStatus = reader.GetString("VerificationStatus"),
                        TotalDuration = reader.GetInt32("TotalDuration"),
                        ExpirationDate = reader.IsDBNull("ExpirationDate") ? (DateTime?)null : reader.GetDateTime("ExpirationDate"),
                        IsRenewed = reader.GetBoolean("IsRenewed")
                    });
                }
                return courses;
            }
        }



        public CourseResponse? GetCourseById(int courseId)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();

                    var cmd = new MySqlCommand("sp_get_course_by_id", con)
                    {
                        CommandType = CommandType.StoredProcedure
                    };
                    cmd.Parameters.AddWithValue("p_course_id", courseId);

                    using (var reader = cmd.ExecuteReader())
                    {
                        // 1. Leer datos generales del curso
                        CourseResponse course = null;
                        if (reader.Read())
                        {
                            course = new CourseResponse
                            {
                                CourseId = reader.GetInt32("course_id"),
                                CourseKey = reader.IsDBNull("course_key") ? null : reader.GetString("course_key"),
                                CourseInfo = new CourseInfo
                                {
                                    CourseName = reader.GetString("course_name"),
                                    ServiceType = reader.GetString("service_type"),
                                    Category = reader.GetString("category"),
                                    Agreement = reader.IsDBNull("agreement") ? null : reader.GetString("agreement"),
                                    TotalDuration = reader.IsDBNull("total_duration") ? (int?)null : reader.GetInt32("total_duration"),
                                    Modality = reader.GetString("modality"),
                                    EducationalOffer = reader.GetString("educational_offer"),
                                    EducationalPlatform = reader.GetString("educational_platform").Split(",").ToList(),
                                    CustomPlatform = reader.IsDBNull("other_educationals_platforms") ? null : reader.GetString("other_educationals_platforms"),
                                    Actors = new List<Actor>() // Se llenará en la siguiente lectura
                                },
                                CreatedBy = reader.GetString("created_by"),
                                ExpirationDate = reader.IsDBNull("expiration_date") ? (DateTime?)null : reader.GetDateTime("expiration_date"),
                                RenewalCount = reader.GetInt32("renewal_count"),
                                ParentCourseId = reader.IsDBNull("parent_course_id") ? (int?)null : reader.GetInt32("parent_course_id"),
                                Status = reader.GetString("status"),
                                ApprovalStatus = reader.GetString("approval_status"),
                                AdminNotes = reader.IsDBNull("admin_notes") ? null : reader.GetString("admin_notes"),
                                Documents = new List<DocumentResponse>() // Se llenará en la siguiente lectura
                            };
                        }

                        if (course == null) return null;

                        // 2. Leer actores y roles
                        reader.NextResult();
                        while (reader.Read())
                        {
                            course.CourseInfo.Actors.Add(new Actor
                            {
                                Id = reader.GetInt32("actor_id"),
                                Name = reader.GetString("actor_name"),
                                Role = reader.GetString("role")
                            });
                        }

                        // 3. Leer documentación del curso
                        reader.NextResult();
                        while (reader.Read())
                        {
                            course.Documents.Add(new DocumentResponse
                            {
                                DocumentId = reader.GetInt32("document_id"),
                                Name = reader.GetString("document_name"),
                                FilePath = reader.GetString("filePath")
                            });
                        }

                        return course;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return null;
            }
        }


        public List<CourseResponse> GetAllCourses()
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();

                    var cmd = new MySqlCommand("sp_get_all_courses", con)
                    {
                        CommandType = CommandType.StoredProcedure
                    };

                    using (var reader = cmd.ExecuteReader())
                    {
                        var courses = new List<CourseResponse>();

                        while (reader.Read())
                        {
                            var course = new CourseResponse
                            {
                                CourseId = reader.GetInt32("course_id"),
                                CourseKey = reader.IsDBNull("course_key") ? null : reader.GetString("course_key"),
                                CourseInfo = new CourseInfo
                                {
                                    CourseName = reader.GetString("course_name"),
                                    ServiceType = reader.GetString("service_type"),
                                    Category = reader.GetString("category"),
                                    Agreement = reader.IsDBNull("agreement") ? null : reader.GetString("agreement"),
                                    TotalDuration = reader.IsDBNull("total_duration") ? (int?)null : reader.GetInt32("total_duration"),
                                    Modality = reader.GetString("modality"),
                                    EducationalOffer = reader.GetString("educational_offer"),
                                    EducationalPlatform = reader.GetString("educational_platform").Split(",").ToList(),
                                    CustomPlatform = reader.IsDBNull("other_educationals_platforms") ? null : reader.GetString("other_educationals_platforms"),
                                    Actors = new List<Actor>()
                                },
                                CreatedBy = reader.GetString("created_by"),
                                ExpirationDate = reader.IsDBNull("expiration_date") ? (DateTime?)null : reader.GetDateTime("expiration_date"),
                                RenewalCount = reader.GetInt32("renewal_count"),
                                ParentCourseId = reader.IsDBNull("parent_course_id") ? (int?)null : reader.GetInt32("parent_course_id"),
                                CreatedAt = reader.GetDateTime("created_at"), // Leer la fecha de creación
                                Status = reader.GetString("status"), // Leer el status
                                ApprovalStatus = reader.GetString("approval_status"), // Leer el approval_status
                                VerificationStatus = reader.GetString("verification_status"), // Leer el verification_status
                                Center = reader.GetString("center_name"),
                                Documents = new List<DocumentResponse>()
                            };

                            courses.Add(course);
                        }

                        // Leer actores y roles para cada curso
                        reader.NextResult();
                        while (reader.Read())
                        {
                            var courseId = reader.GetInt32("course_id");
                            var course = courses.FirstOrDefault(c => c.CourseId == courseId);
                            if (course != null)
                            {
                                course.CourseInfo.Actors.Add(new Actor
                                {
                                    Id = reader.GetInt32("actor_id"),
                                    Name = reader.GetString("actor_name"),
                                    Role = reader.GetString("role")
                                });
                            }
                        }

                        // Leer documentación para cada curso
                        reader.NextResult();
                        while (reader.Read())
                        {
                            var courseId = reader.GetInt32("course_id");
                            var course = courses.FirstOrDefault(c => c.CourseId == courseId);
                            if (course != null)
                            {
                                course.Documents.Add(new DocumentResponse
                                {
                                    DocumentId = reader.GetInt32("document_id"),
                                    Name = reader.GetString("document_name"),
                                    FilePath = reader.GetString("filePath")
                                });
                            }
                        }

                        return courses;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return null;
            }
        }
        public (int statusCode, string message) RegisterCourseSession(CourseSessionRequest request)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();

                    // 1. Obtener el course_id
                    var courseCmd = new MySqlCommand("SELECT id FROM courses WHERE course_key = @course_key", con);
                    courseCmd.Parameters.AddWithValue("@course_key", request.CourseKey);
                    var courseId = Convert.ToInt32(courseCmd.ExecuteScalar());

                    if (courseId <= 0)
                    {
                        return (-1, "Error: No se encontró un curso con la clave proporcionada.");
                    }

                    // 2. Usar el folder que ya viene en la solicitud
                    string folder = request.FolderName;

                    // 3. Preparar el JSON del cronograma
                    var scheduleJson = JsonConvert.SerializeObject(
                        request.Schedule.Select(entry => new
                        {
                            date = DateTime.Parse(entry.Date).ToString("yyyy-MM-dd"),
                            start_time = DateTime.Parse(entry.Start).ToString("HH:mm:ss"),
                            end_time = DateTime.Parse(entry.End).ToString("HH:mm:ss")
                        })
                    );

                    // 4. Llamar al SP con el parámetro del folder
                    using (var cmd = new MySqlCommand("sp_register_course_session", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("p_course_id", courseId);
                        cmd.Parameters.AddWithValue("p_period", request.Period);
                        cmd.Parameters.AddWithValue("p_num_participants", request.NumberOfParticipants);
                        cmd.Parameters.AddWithValue("p_num_certificates", request.NumberOfCertificates);
                        cmd.Parameters.AddWithValue("p_cost", request.Cost);
                        cmd.Parameters.AddWithValue("p_schedule_json", scheduleJson);
                        cmd.Parameters.AddWithValue("p_documentation_folder", folder);

                        var statusCodeParam = new MySqlParameter("p_status_code", MySqlDbType.Int32)
                        { Direction = ParameterDirection.Output };
                        var messageParam = new MySqlParameter("p_message", MySqlDbType.VarChar, 255)
                        { Direction = ParameterDirection.Output };

                        cmd.Parameters.Add(statusCodeParam);
                        cmd.Parameters.Add(messageParam);

                        cmd.ExecuteNonQuery();

                        return (Convert.ToInt32(statusCodeParam.Value), messageParam.Value.ToString());
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return (-1, "Error interno del servidor.");
            }
        }

        public async Task<string> GetSignedRequestLetterPath(int sessionId)
        {
            using (var con = new MySqlConnection(_config.GetConnectionString("default")))
            {
                await con.OpenAsync();
                string query = "SELECT signed_request_letter_path FROM course_sessions WHERE id = @sessionId";
                using (var cmd = new MySqlCommand(query, con))
                {
                    cmd.Parameters.AddWithValue("@sessionId", sessionId);
                    return (await cmd.ExecuteScalarAsync())?.ToString();
                }
            }
        }

        public async Task<(string DocumentPath, string FolderName)> GetSessionData(int sessionId)
        {
            using (var con = new MySqlConnection(_config.GetConnectionString("default")))
            {
                await con.OpenAsync();
                string query = "SELECT signed_request_letter_path, documentation_folder FROM course_sessions WHERE id = @sessionId";
                using (var cmd = new MySqlCommand(query, con))
                {
                    cmd.Parameters.AddWithValue("@sessionId", sessionId);
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return (
                                reader["signed_request_letter_path"]?.ToString() ?? string.Empty,
                                reader["documentation_folder"]?.ToString() ?? string.Empty
                            );
                        }
                    }
                }
            }
            return (string.Empty, string.Empty);
        }

        public async Task<bool> CanDeleteFolder(string folderName, int sessionId)
        {
            using (var con = new MySqlConnection(_config.GetConnectionString("default")))
            {
                await con.OpenAsync();
                string query = "SELECT COUNT(*) FROM course_sessions WHERE documentation_folder = @folder AND id != @sessionId";
                using (var cmd = new MySqlCommand(query, con))
                {
                    cmd.Parameters.AddWithValue("@folder", folderName);
                    cmd.Parameters.AddWithValue("@sessionId", sessionId);
                    int otherSessionsCount = Convert.ToInt32(await cmd.ExecuteScalarAsync());
                    return otherSessionsCount == 0;
                }
            }
        }

        public async Task<(int statusCode, string message)> ApproveSession(int sessionId)
        {
            using (var con = new MySqlConnection(_config.GetConnectionString("default")))
            {
                await con.OpenAsync();
                using (var cmd = new MySqlCommand("sp_approve_course_session", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("p_session_id", sessionId);

                    var statusCodeParam = new MySqlParameter("p_status_code", MySqlDbType.Int32)
                    { Direction = ParameterDirection.Output };
                    var messageParam = new MySqlParameter("p_message", MySqlDbType.VarChar, 255)
                    { Direction = ParameterDirection.Output };

                    cmd.Parameters.Add(statusCodeParam);
                    cmd.Parameters.Add(messageParam);

                    await cmd.ExecuteNonQueryAsync();

                    return (Convert.ToInt32(statusCodeParam.Value), messageParam.Value.ToString());
                }
            }
        }

        public async Task<(int statusCode, string message)> RejectSession(int sessionId)
        {
            using (var con = new MySqlConnection(_config.GetConnectionString("default")))
            {
                await con.OpenAsync();
                using (var cmd = new MySqlCommand("sp_reject_course_session", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("p_session_id", sessionId);

                    var statusCodeParam = new MySqlParameter("p_status_code", MySqlDbType.Int32)
                    { Direction = ParameterDirection.Output };
                    var messageParam = new MySqlParameter("p_message", MySqlDbType.VarChar, 255)
                    { Direction = ParameterDirection.Output };

                    cmd.Parameters.Add(statusCodeParam);
                    cmd.Parameters.Add(messageParam);

                    await cmd.ExecuteNonQueryAsync();

                    return (Convert.ToInt32(statusCodeParam.Value), messageParam.Value.ToString());
                }
            }
        }


        public List<PendingApertureDTO> GetUserPendingApertures(string username)
        {
            try
            {
                var pendingApertures = new List<PendingApertureDTO>();
                var schedulesBySessionId = new Dictionary<int, List<ScheduleEntryDTO>>();

                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();

                    using (var cmd = new MySqlCommand("sp_get_user_pending_apertures", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("p_username", username);

                        using (var reader = cmd.ExecuteReader())
                        {
                            // Leer los datos principales de las aperturas
                            while (reader.Read())
                            {
                                try
                                {
                                    var pendingAperture = new PendingApertureDTO
                                    {
                                        SessionId = reader.GetInt32("sessionId"),
                                        CourseKey = reader.IsDBNull("courseKey") ? string.Empty : reader.GetString("courseKey"),
                                        CourseName = reader.IsDBNull("courseName") ? string.Empty : reader.GetString("courseName"),
                                        Period = reader.IsDBNull("period") ? string.Empty : reader.GetString("period"),
                                        NumberOfParticipants = reader.IsDBNull("numberOfParticipants") ? 0 : reader.GetInt32("numberOfParticipants"),
                                        NumberOfCertificates = reader.IsDBNull("numberOfCertificates") ? 0 : reader.GetInt32("numberOfCertificates"),
                                        Cost = reader.IsDBNull("cost") ? 0 : reader.GetDecimal("cost"),
                                        SignedRequestLetterPath = reader.IsDBNull("signedRequestLetterPath") ? null : reader.GetString("signedRequestLetterPath"),
                                        CenterName = reader.IsDBNull("centerName") ? string.Empty : reader.GetString("centerName"),
                                        // Campos del director
                                        DirectorName = reader.IsDBNull("directorName") ? string.Empty : reader.GetString("directorName"),
                                        DirectorTitle = reader.IsDBNull("directorTitle") ? string.Empty : reader.GetString("directorTitle"),
                                        DirectorGender = reader.IsDBNull("directorGender") ? string.Empty : reader.GetString("directorGender"),
                                        // Resto de campos
                                        Modality = reader.IsDBNull("modality") ? string.Empty : reader.GetString("modality"),
                                        TotalDuration = reader.IsDBNull("totalDuration") ? 0 : reader.GetInt32("totalDuration"),
                                        StartDate = reader.IsDBNull("startDate") ? DateTime.MinValue : reader.GetDateTime("startDate"),
                                        EndDate = reader.IsDBNull("endDate") ? DateTime.MinValue : reader.GetDateTime("endDate"),
                                        TotalDays = reader.IsDBNull("totalDays") ? 0 : reader.GetInt32("totalDays"),
                                        Instructors = reader.IsDBNull("instructors") ? string.Empty : reader.GetString("instructors"),
                                        // Nuevos campos
                                        Signed = reader.IsDBNull("signed") ? false : reader.GetBoolean("signed"),
                                        ApprovalStatus = reader.IsDBNull("approvalStatus") ? "pending" : reader.GetString("approvalStatus"),
                                        Schedule = new List<ScheduleEntryDTO>()
                                    };

                                    pendingApertures.Add(pendingAperture);
                                    schedulesBySessionId[pendingAperture.SessionId] = pendingAperture.Schedule;
                                }
                                catch (Exception ex)
                                {
                                    Console.WriteLine($"Error al leer una apertura: {ex.Message}");
                                    // Continuar con la siguiente apertura
                                }
                            }

                            // Leer el cronograma
                            if (reader.NextResult())
                            {
                                while (reader.Read())
                                {
                                    try
                                    {
                                        var sessionId = reader.GetInt32("sessionId");

                                        if (schedulesBySessionId.ContainsKey(sessionId))
                                        {
                                            var schedule = new ScheduleEntryDTO
                                            {
                                                Date = reader.IsDBNull("date") ? string.Empty : reader.GetDateTime("date").ToString("yyyy-MM-dd"),
                                                Start = reader.IsDBNull("start") ? string.Empty : reader.GetTimeSpan("start").ToString(@"hh\:mm"),
                                                End = reader.IsDBNull("end") ? string.Empty : reader.GetTimeSpan("end").ToString(@"hh\:mm")
                                            };

                                            schedulesBySessionId[sessionId].Add(schedule);
                                        }
                                    }
                                    catch (Exception ex)
                                    {
                                        Console.WriteLine($"Error al leer una entrada de cronograma: {ex.Message}");
                                        // Continuar con la siguiente entrada
                                    }
                                }
                            }
                        }
                    }
                }

                return pendingApertures;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetUserPendingApertures: {ex.Message}");
                return new List<PendingApertureDTO>(); // Devolver lista vacía en lugar de null
            }
        }
        public async Task<string> GetCourseSessionFolder(int sessionId)
        {
            using (var con = new MySqlConnection(_config.GetConnectionString("default")))
            {
                await con.OpenAsync();
                string query = "SELECT documentation_folder FROM course_sessions WHERE id = @sessionId";
                using (var cmd = new MySqlCommand(query, con))
                {
                    cmd.Parameters.AddWithValue("@sessionId", sessionId);
                    return (await cmd.ExecuteScalarAsync())?.ToString();
                }
            }
        }

        public async Task AssignFolderToSession(int sessionId, string folderName)
        {
            using (var con = new MySqlConnection(_config.GetConnectionString("default")))
            {
                await con.OpenAsync();
                string query = "UPDATE course_sessions SET documentation_folder = @folder WHERE id = @sessionId";
                using (var cmd = new MySqlCommand(query, con))
                {
                    cmd.Parameters.AddWithValue("@sessionId", sessionId);
                    cmd.Parameters.AddWithValue("@folder", folderName);
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task<(int statusCode, string message)> UploadSignedRequestLetter(
            int sessionId,
            string filePath,
            string folderName)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    await con.OpenAsync();

                    // Aquí llamamos al SP con la información necesaria
                    using (var cmd = new MySqlCommand("sp_upload_signed_request_letter", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("p_session_id", sessionId);
                        cmd.Parameters.AddWithValue("p_file_path", filePath);
                        cmd.Parameters.AddWithValue("p_folder_name", folderName);

                        var statusCodeParam = new MySqlParameter("p_status_code", MySqlDbType.Int32)
                        {
                            Direction = ParameterDirection.Output
                        };
                        var messageParam = new MySqlParameter("p_message", MySqlDbType.VarChar, 255)
                        {
                            Direction = ParameterDirection.Output
                        };

                        cmd.Parameters.Add(statusCodeParam);
                        cmd.Parameters.Add(messageParam);

                        await cmd.ExecuteNonQueryAsync();

                        return (Convert.ToInt32(statusCodeParam.Value), messageParam.Value.ToString());
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en UploadSignedRequestLetter: {ex.Message}");
                return (500, "Error al procesar la solicitud");
            }
        }

        public List<PendingApertureDTO> GetPendingApertures()
        {
            try
            {
                var sessions = new List<PendingApertureDTO>();

                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();

                    using (var cmd = new MySqlCommand("sp_get_pending_apertures", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        using (var reader = cmd.ExecuteReader())
                        {
                            // Primer resultset: Información principal
                            while (reader.Read())
                            {
                                try
                                {
                                    var session = new PendingApertureDTO
                                    {
                                        SessionId = reader.GetInt32("session_id"),
                                        CourseKey = reader.IsDBNull("course_key") ? string.Empty : reader.GetString("course_key"),
                                        CourseName = reader.IsDBNull("course_name") ? string.Empty : reader.GetString("course_name"),
                                        Period = reader.IsDBNull("period") ? string.Empty : reader.GetString("period"),
                                        NumberOfParticipants = reader.IsDBNull("number_of_participants") ? 0 : reader.GetInt32("number_of_participants"),
                                        NumberOfCertificates = reader.IsDBNull("number_of_certificates") ? 0 : reader.GetInt32("number_of_certificates"),
                                        Cost = reader.IsDBNull("cost") ? 0 : reader.GetDecimal("cost"),
                                        SignedRequestLetterPath = reader.IsDBNull("signed_request_letter_path") ? null : reader.GetString("signed_request_letter_path"),
                                        CenterName = reader.IsDBNull("center_name") ? string.Empty : reader.GetString("center_name"),
                                        // Nuevos campos
                                        DirectorName = reader.IsDBNull("director_name") ? string.Empty : reader.GetString("director_name"),
                                        DirectorTitle = reader.IsDBNull("director_title") ? string.Empty : reader.GetString("director_title"),
                                        DirectorGender = reader.IsDBNull("director_gender") ? string.Empty : reader.GetString("director_gender"),
                                        // Resto de campos
                                        Modality = reader.IsDBNull("modality") ? string.Empty : reader.GetString("modality"),
                                        TotalDuration = reader.IsDBNull("total_duration") ? 0 : reader.GetInt32("total_duration"),
                                        StartDate = reader.IsDBNull("start_date") ? DateTime.MinValue : reader.GetDateTime("start_date"),
                                        EndDate = reader.IsDBNull("end_date") ? DateTime.MinValue : reader.GetDateTime("end_date"),
                                        TotalDays = reader.IsDBNull("total_days") ? 0 : reader.GetInt32("total_days"),
                                        Instructors = reader.IsDBNull("instructors") ? string.Empty : reader.GetString("instructors"),
                                        Schedule = new List<ScheduleEntryDTO>()
                                    };
                                    sessions.Add(session);
                                }
                                catch (Exception ex)
                                {
                                    Console.WriteLine($"Error leyendo sesión: {ex.Message}");
                                    // Continuar con la siguiente sesión
                                }
                            }

                            // Segundo resultset: Cronograma
                            if (reader.NextResult())
                            {
                                while (reader.Read())
                                {
                                    try
                                    {
                                        int sessionId = reader.GetInt32("session_id");
                                        var session = sessions.FirstOrDefault(s => s.SessionId == sessionId);

                                        if (session != null)
                                        {
                                            session.Schedule.Add(new ScheduleEntryDTO
                                            {
                                                Date = reader.GetDateTime("date").ToString("yyyy-MM-dd"),
                                                Start = reader.GetTimeSpan("start_time").ToString(@"hh\:mm"),
                                                End = reader.GetTimeSpan("end_time").ToString(@"hh\:mm")
                                            });
                                        }
                                    }
                                    catch (Exception ex)
                                    {
                                        Console.WriteLine($"Error leyendo cronograma: {ex.Message}");
                                        // Continuar con el siguiente registro
                                    }
                                }
                            }
                        }
                    }
                }

                return sessions;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetPendingApertures: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return new List<PendingApertureDTO>(); // Devolver lista vacía en lugar de null
            }
        }

        public object GetSessionOfficialLetter(int sessionId)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();
                    var query = @"
                SELECT 
                    cs.id as session_id,
                    cs.official_letter_path as file_path,
                    cs.documentation_folder as folder
                FROM course_sessions cs
                WHERE cs.id = @sessionId 
                AND cs.approval_status = 'approved'";

                    using (var cmd = new MySqlCommand(query, con))
                    {
                        cmd.Parameters.AddWithValue("@sessionId", sessionId);
                        using (var reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                return new
                                {
                                    SessionId = reader.GetInt32("session_id"),
                                    FilePath = reader.GetString("file_path"),
                                    Folder = reader.GetString("folder")
                                };
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return null;
            }
            return null;
        }

        public List<CourseWithSessionsResponse> GetCoursesWithSessions(string username)
        {
            List<CourseWithSessionsResponse> courses = new List<CourseWithSessionsResponse>();

            using (var con = new MySqlConnection(_config.GetConnectionString("default")))
            {
                con.Open();

                var cmd = new MySqlCommand("sp_get_courses_with_sessions", con)
                {
                    CommandType = CommandType.StoredProcedure
                };
                cmd.Parameters.AddWithValue("p_username", username);

                using (var reader = cmd.ExecuteReader())
                {
                    Dictionary<string, CourseWithSessionsResponse> courseMap = new Dictionary<string, CourseWithSessionsResponse>();

                    // Leer los cursos
                    while (reader.Read())
                    {
                        string title = reader.GetString("title");

                        // Validamos si course_key es NULL
                        string? courseKey = reader.IsDBNull(reader.GetOrdinal("clave"))
                            ? null
                            : reader.GetString("clave");

                        if (!courseMap.ContainsKey(title))
                        {
                            courseMap[title] = new CourseWithSessionsResponse
                            {
                                Id = reader.GetInt32("course_id"),
                                Title = title,
                                CourseKeys = new List<string>(), // Lista de claves de cursos
                                Sessions = new List<SessionResponse>(),
                                CourseStatus = reader.GetString("course_status"),
                                ApprovalStatus = reader.GetString("approval_status")
                            };
                        }

                        // Agregar la clave solo si existe (si el curso ya fue aprobado)
                        if (!string.IsNullOrEmpty(courseKey))
                        {
                            courseMap[title].CourseKeys.Add(courseKey);
                        }
                    }

                    // Leer las sesiones SOLO si el curso tiene clave
                    if (reader.NextResult())
                    {
                        while (reader.Read())
                        {
                            // Validamos si course_key es NULL
                            string? courseKey = reader.IsDBNull(reader.GetOrdinal("clave"))
                                ? null
                                : reader.GetString("clave");

                            // Si la clave es NULL, este curso NO puede tener sesiones
                            if (string.IsNullOrEmpty(courseKey)) continue;

                            foreach (var course in courseMap.Values)
                            {
                                if (course.CourseKeys.Contains(courseKey))
                                {
                                    course.Sessions.Add(new SessionResponse
                                    {
                                        Id = reader.GetInt32("session_id"),
                                        Clave = courseKey,
                                        Periodo = reader.GetString("periodo"),
                                        Participantes = reader.GetInt32("participantes"),
                                        Constancias = reader.GetInt32("constancias"),
                                        SessionStatus = reader.GetString("estatus"),
                                        SessionApprovalStatus = reader.GetString("estatus_de_aprobacion"),
                                        CertificatesRequested = reader.GetBoolean("certificates_requested"),
                                        CertificatesDelivered = reader.GetBoolean("certificates_delivered")
                                    });
                                }
                            }
                        }
                    }

                    courses = courseMap.Values.ToList();
                }
            }

            return courses;
        }


        public async Task<(int statusCode, string message)> RequestCertificates(
     int sessionId,
     List<object> documents,
     string sessionFolder)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    await con.OpenAsync();

                    // Convertir la lista de documentos a JSON
                    var jsonDocs = JsonConvert.SerializeObject(documents);

                    // Llamar al procedimiento almacenado
                    using (var cmd = new MySqlCommand("sp_request_certificates", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        // Parámetros de entrada
                        cmd.Parameters.AddWithValue("p_session_id", sessionId);
                        cmd.Parameters.AddWithValue("p_documentation", jsonDocs);
                        cmd.Parameters.AddWithValue("p_documentation_folder", sessionFolder);

                        // Parámetros de salida
                        var statusParam = new MySqlParameter("p_status_code", MySqlDbType.Int32)
                        {
                            Direction = ParameterDirection.Output
                        };
                        var messageParam = new MySqlParameter("p_message", MySqlDbType.VarChar, 255)
                        {
                            Direction = ParameterDirection.Output
                        };

                        cmd.Parameters.Add(statusParam);
                        cmd.Parameters.Add(messageParam);

                        await cmd.ExecuteNonQueryAsync();

                        return (Convert.ToInt32(statusParam.Value), messageParam.Value.ToString());
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en RequestCertificates: {ex.Message}");
                return (-1, "Error al procesar la solicitud de constancias");
            }
        }


        public async Task<(int statusCode, string message)> UploadCertificateOfficialLetter(
    int sessionId,
    string filePath,
    int numberOfCertificates)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    await con.OpenAsync();

                    // Llamar al procedimiento almacenado para guardar en la base de datos y actualizar number_of_certificates
                    using (var cmd = new MySqlCommand("sp_upload_certificate_official_letter", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        // Parámetros de entrada
                        cmd.Parameters.AddWithValue("p_session_id", sessionId);
                        cmd.Parameters.AddWithValue("p_file_path", filePath);
                        cmd.Parameters.AddWithValue("p_number_of_certificates", numberOfCertificates);

                        // Parámetros de salida
                        var statusParam = new MySqlParameter("p_status_code", MySqlDbType.Int32)
                        {
                            Direction = ParameterDirection.Output
                        };
                        var messageParam = new MySqlParameter("p_message", MySqlDbType.VarChar, 255)
                        {
                            Direction = ParameterDirection.Output
                        };

                        cmd.Parameters.Add(statusParam);
                        cmd.Parameters.Add(messageParam);

                        await cmd.ExecuteNonQueryAsync();

                        return (Convert.ToInt32(statusParam.Value), messageParam.Value.ToString());
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en UploadCertificateOfficialLetter: {ex.Message}");
                return (-1, "Error al subir el oficio de constancias y actualizar las constancias entregadas");
            }
        }


        public List<CourseSessionResponse> GetCourseSessions(int courseId)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();
                    var cmd = new MySqlCommand("sp_get_course_sessions", con)
                    {
                        CommandType = CommandType.StoredProcedure
                    };
                    cmd.Parameters.AddWithValue("p_course_id", courseId);

                    using (var reader = cmd.ExecuteReader())
                    {
                        var sessions = new List<CourseSessionResponse>();

                        while (reader.Read())
                        {
                            var session = new CourseSessionResponse
                            {
                                SessionId = reader.GetInt32("session_id"),
                                Period = reader.GetString("period"),
                                NumberOfParticipants = reader.GetInt32("number_of_participants"),
                                NumberOfCertificates = reader.GetInt32("number_of_certificates"),
                                Cost = reader.GetDecimal("cost"),
                                Status = reader.GetString("status"),
                                CertificatesRequested = reader.GetBoolean("certificates_requested"),
                                CreatedAt = reader.GetDateTime("created_at"),
                                Schedule = JsonConvert.DeserializeObject<List<ScheduleEntry>>(
                                    reader.GetString("schedule")
                                )
                            };
                            sessions.Add(session);
                        }

                        return sessions;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return null;
            }
        }

        public async Task<string> GetCourseFolder(int courseId)
        {
            using (var con = new MySqlConnection(_config.GetConnectionString("default")))
            {
                await con.OpenAsync();
                string query = "SELECT documentation_folder FROM courses WHERE id = @courseId";
                using (var cmd = new MySqlCommand(query, con))
                {
                    cmd.Parameters.AddWithValue("@courseId", courseId);
                    return (await cmd.ExecuteScalarAsync())?.ToString();
                }
            }
        }

        public (int statusCode, string message) RejectCourse(int courseId, string rejectionNotes, string rejectionType)
        {
            try
            {
                string adminNotes = null;
                string verificationNotes = null;

                // Determinar qué tipo de notas son según quién realiza el rechazo
                if (rejectionType.Equals("admin", StringComparison.OrdinalIgnoreCase))
                {
                    adminNotes = rejectionNotes;
                }
                else if (rejectionType.Equals("verifier", StringComparison.OrdinalIgnoreCase))
                {
                    verificationNotes = rejectionNotes;
                }

                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();

                    // Llamar al SP para eliminar el curso y registrar el rechazo
                    using (var cmd = new MySqlCommand("sp_delete_course", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("p_course_id", courseId);
                        cmd.Parameters.AddWithValue("p_admin_notes", adminNotes ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("p_verification_notes", verificationNotes ?? (object)DBNull.Value);

                        var statusCodeParam = new MySqlParameter("p_status_code", MySqlDbType.Int32)
                        {
                            Direction = ParameterDirection.Output
                        };
                        var messageParam = new MySqlParameter("p_message", MySqlDbType.VarChar, 255)
                        {
                            Direction = ParameterDirection.Output
                        };

                        cmd.Parameters.Add(statusCodeParam);
                        cmd.Parameters.Add(messageParam);

                        cmd.ExecuteNonQuery();

                        return (Convert.ToInt32(statusCodeParam.Value), messageParam.Value.ToString());
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en RejectCourse: {ex.Message}");
                return (-1, $"Error al rechazar el curso: {ex.Message}");
            }
        }

        public (int statusCode, string message) UpdateCourseApprovalStatus(int courseId, string approvalStatus, string? adminNotes = null)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();

                    // Obtener datos del curso
                    var getCourseCmd = new MySqlCommand(@"
                        SELECT c.id, c.parent_course_id, c.renewal_count,
                               u.center_id, ctr.type AS centerType, ctr.identifier AS centerIdentifier,
                               c.verification_status, c.course_key
                        FROM courses c
                        JOIN users u ON c.user_id = u.id
                        JOIN centers ctr ON u.center_id = ctr.id
                        WHERE c.id = @courseId", con);

                    getCourseCmd.Parameters.AddWithValue("@courseId", courseId);

                    using (var reader = getCourseCmd.ExecuteReader())
                    {
                        if (!reader.Read())
                        {
                            return (0, "No se encontró el curso para actualizar.");
                        }

                        // Solo verificamos el estado actual de verificación y si ya tiene clave
                        var verificationStatus = reader["verification_status"].ToString();
                        var existingCourseKey = reader.IsDBNull(reader.GetOrdinal("course_key")) ? null : reader.GetString("course_key");

                        var parentCourseId = reader["parent_course_id"] as int?;
                        var renewalCount = Convert.ToInt32(reader["renewal_count"]);
                        var centerType = reader["centerType"].ToString();
                        var centerIdentifier = Convert.ToInt32(reader["centerIdentifier"]).ToString("D2");
                        reader.Close();

                        // Si el curso es rechazado, solo actualiza estado y admin_notes
                        if (approvalStatus.Equals("rejected", StringComparison.OrdinalIgnoreCase))
                        {
                            return RejectCourse(courseId, adminNotes, "admin");
                        }

                        // Si el curso es aprobado, verificamos si ambos estados son "approved"
                        bool shouldGenerateKey = approvalStatus.Equals("approved", StringComparison.OrdinalIgnoreCase) &&
                                                 verificationStatus.Equals("approved", StringComparison.OrdinalIgnoreCase) &&
                                                 string.IsNullOrEmpty(existingCourseKey);

                        // Variables para la clave y fecha
                        string courseKey = null;
                        DateTime expirationDate = DateTime.Now.AddYears(2);
                        string sqlApprove;

                        // Solo generamos la clave si ambos estados son "approved" y aún no tiene clave
                        if (shouldGenerateKey)
                        {
                            var currentDate = DateTime.Now;

                            // Generación de clave para curso original o renovación
                            if (parentCourseId == null)
                            {
                                // Caso: CURSO ORIGINAL
                                var countCoursesCmd = new MySqlCommand("SELECT COUNT(*) FROM courses WHERE YEAR(created_at) = @currentYear AND course_key IS NOT NULL", con);
                                countCoursesCmd.Parameters.AddWithValue("@currentYear", currentDate.Year);
                                var nextCourseNumber = Convert.ToInt32(countCoursesCmd.ExecuteScalar()) + 1;

                                var courseCount = nextCourseNumber.ToString("D3");  // Convertir a formato 3 dígitos
                                var vigencia = $"{currentDate.Year}-{currentDate.Year + 2}";
                                courseKey = $"DVDR/{centerType}/{centerIdentifier}/{courseCount}/{vigencia}";
                            }
                            else
                            {
                                // Caso: RENOVACIÓN
                                var getParentCourseCmd = new MySqlCommand("SELECT course_key, renewal_count FROM courses WHERE id = @parentCourseId", con);
                                getParentCourseCmd.Parameters.AddWithValue("@parentCourseId", parentCourseId);
                                using (var parentReader = getParentCourseCmd.ExecuteReader())
                                {
                                    if (!parentReader.Read())
                                    {
                                        return (0, "Curso a renovar no encontrado.");
                                    }

                                    var parentCourseKey = parentReader.GetString("course_key");
                                    renewalCount = parentReader.GetInt32("renewal_count") + 1;
                                }

                                var countCoursesCmd = new MySqlCommand("SELECT COUNT(*) FROM courses WHERE YEAR(created_at) = @currentYear AND course_key IS NOT NULL", con);
                                countCoursesCmd.Parameters.AddWithValue("@currentYear", currentDate.Year);
                                var courseCount = (Convert.ToInt32(countCoursesCmd.ExecuteScalar()) + 1).ToString("D3");

                                var vigencia = $"{currentDate.Year}-{currentDate.Year + 2}";
                                courseKey = $"DVDR/{centerType}/{centerIdentifier}/{courseCount}_{renewalCount}/{vigencia}";
                            }

                            // SQL para actualizar con clave y fecha
                            sqlApprove = @"
                                UPDATE courses
                                SET approval_status = @approvalStatus,
                                    admin_notes = @adminNotes,
                                    course_key = @courseKey,
                                    expiration_date = @expirationDate
                                WHERE id = @courseId;
                            ";
                        }
                        else
                        {                      
                            sqlApprove = @"
                                UPDATE courses
                                SET approval_status = @approvalStatus,                             
                                    admin_notes = @adminNotes
                                WHERE id = @courseId;
                            ";
                        }

                        using (var cmdApprove = new MySqlCommand(sqlApprove, con))
                        {
                            cmdApprove.Parameters.AddWithValue("@approvalStatus", approvalStatus);
                            cmdApprove.Parameters.AddWithValue("@adminNotes", adminNotes ?? (object)DBNull.Value);
                            cmdApprove.Parameters.AddWithValue("@courseId", courseId);

                            // Sólo añadimos estos parámetros si vamos a generar la clave
                            if (shouldGenerateKey)
                            {
                                cmdApprove.Parameters.AddWithValue("@courseKey", courseKey);
                                cmdApprove.Parameters.AddWithValue("@expirationDate", expirationDate);
                            }

                            var rows = cmdApprove.ExecuteNonQuery();

                            string successMessage;
                            if (shouldGenerateKey)
                            {
                                successMessage = $"Curso aprobado exitosamente. Clave generada: {courseKey}";
                            }
                            else
                            {
                                successMessage = "Curso aprobado exitosamente y marcado como verificado. La clave se generará automáticamente.";
                            }

                            return rows > 0
                                ? (1, successMessage)
                                : (0, "No se pudo actualizar el curso como aprobado.");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en UpdateCourseApprovalStatus: {ex.Message}");
                return (0, "Error al actualizar el estado de aprobación.");
            }
        }

        public (int statusCode, string message) UpdateCourseVerificationStatus(int courseId, string verificationStatus, string? verificationNotes = null)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();

                    // Verificar si el curso existe y obtener datos necesarios
                    var getCourseCmd = new MySqlCommand(@"
                        SELECT c.id, c.approval_status, c.course_key, c.parent_course_id, c.renewal_count,
                               u.center_id, ctr.type AS centerType, ctr.identifier AS centerIdentifier
                        FROM courses c
                        JOIN users u ON c.user_id = u.id
                        JOIN centers ctr ON u.center_id = ctr.id
                        WHERE c.id = @courseId", con);

                    getCourseCmd.Parameters.AddWithValue("@courseId", courseId);

                    using (var reader = getCourseCmd.ExecuteReader())
                    {
                        if (!reader.Read())
                        {
                            return (0, "No se encontró el curso para actualizar.");
                        }

                        // Verificar si ya está aprobado administrativamente y no tiene clave
                        var approvalStatus = reader.GetString("approval_status");
                        var courseKey = reader.IsDBNull(reader.GetOrdinal("course_key")) ? null : reader.GetString("course_key");
                        var parentCourseId = reader.IsDBNull(reader.GetOrdinal("parent_course_id")) ? (int?)null : reader.GetInt32("parent_course_id");
                        var renewalCount = reader.GetInt32("renewal_count");
                        var centerType = reader.GetString("centerType");
                        var centerIdentifier = reader.GetInt32("centerIdentifier").ToString("D2");
                        reader.Close();

                        if (verificationStatus.Equals("rejected", StringComparison.OrdinalIgnoreCase))
                        {
                            return RejectCourse(courseId, verificationNotes, "verifier");
                        }

                        // Si el curso ya está aprobado administrativamente, verificado ahora, y no tiene clave, generar la clave
                        bool shouldGenerateKey =
                            verificationStatus.Equals("approved", StringComparison.OrdinalIgnoreCase) &&
                            approvalStatus.Equals("approved", StringComparison.OrdinalIgnoreCase) &&
                            string.IsNullOrEmpty(courseKey);

                        if (shouldGenerateKey)
                        {
                            // Generar la clave
                            var currentDate = DateTime.Now;
                            var expirationDate = currentDate.AddYears(2);
                            string courseKeyGenerated;

                            if (parentCourseId == null) // Nuevo curso
                            {
                                // Contamos solo los cursos APROBADOS en el año
                                var countApprovedCoursesCmd = new MySqlCommand(@"
                                    SELECT COUNT(*)
                                    FROM courses
                                    WHERE YEAR(created_at) = @currentYear 
                                    AND course_key IS NOT NULL", con);

                                countApprovedCoursesCmd.Parameters.AddWithValue("@currentYear", currentDate.Year);
                                var approvedCount = Convert.ToInt32(countApprovedCoursesCmd.ExecuteScalar()) + 1;

                                var courseCount = approvedCount.ToString("D3");
                                var vigencia = $"{currentDate.Year}-{currentDate.Year + 2}";

                                courseKeyGenerated = $"DVDR/{centerType}/{centerIdentifier}/{courseCount}/{vigencia}";
                            }
                            else // Curso renovado
                            {
                                var newRenewalCount = renewalCount + 1;

                                var countApprovedCoursesCmd = new MySqlCommand(@"
                                    SELECT COUNT(*)
                                    FROM courses
                                    WHERE YEAR(created_at) = @currentYear 
                                    AND course_key IS NOT NULL", con);

                                countApprovedCoursesCmd.Parameters.AddWithValue("@currentYear", currentDate.Year);
                                var approvedCount = Convert.ToInt32(countApprovedCoursesCmd.ExecuteScalar()) + 1;

                                var courseCount = approvedCount.ToString("D3");
                                var vigencia = $"{currentDate.Year}-{currentDate.Year + 2}";

                                courseKeyGenerated = $"DVDR/{centerType}/{centerIdentifier}/{courseCount}_{newRenewalCount}/{vigencia}";
                            }

                            // Actualizar el curso con la clave generada y fecha de expiración
                            var sqlUpdateKey = @"
                                UPDATE courses
                                SET verification_status = @verificationStatus,
                                    verification_notes = @verificationNotes,
                                    course_key = @courseKey,
                                    expiration_date = @expirationDate
                                WHERE id = @courseId;
                            ";

                            using (var updateCmd = new MySqlCommand(sqlUpdateKey, con))
                            {
                                updateCmd.Parameters.AddWithValue("@verificationStatus", verificationStatus);
                                updateCmd.Parameters.AddWithValue("@verificationNotes", verificationNotes ?? (object)DBNull.Value);
                                updateCmd.Parameters.AddWithValue("@courseKey", courseKeyGenerated);
                                updateCmd.Parameters.AddWithValue("@expirationDate", expirationDate);
                                updateCmd.Parameters.AddWithValue("@courseId", courseId);
                                updateCmd.ExecuteNonQuery();
                            }

                            return (1, $"Curso verificado y clave generada exitosamente: {courseKeyGenerated}");
                        }
                        else
                        {
                            // Si no se genera clave pero hay que actualizar el estado de verificación
                            var updateStatusCmd = new MySqlCommand(@"
                                UPDATE courses
                                SET verification_status = @verificationStatus,
                                    verification_notes = @verificationNotes
                                WHERE id = @courseId", con);

                            updateStatusCmd.Parameters.AddWithValue("@verificationStatus", verificationStatus);
                            updateStatusCmd.Parameters.AddWithValue("@verificationNotes", verificationNotes ?? (object)DBNull.Value);
                            updateStatusCmd.Parameters.AddWithValue("@courseId", courseId);
                            updateStatusCmd.ExecuteNonQuery();

                            // Mensaje estándar si no se generó clave
                            string statusMessage = verificationStatus.Equals("approved", StringComparison.OrdinalIgnoreCase)
                                ? "Curso verificado exitosamente."
                                : "Curso rechazado en verificación.";

                            return (1, statusMessage);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en UpdateCourseVerificationStatus: {ex.Message}");
                return (0, "Error al actualizar el estado de verificación.");
            }
        }

        public List<SessionResponseRC> GetRequestedCertificatesSessions()
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();

                    var cmd = new MySqlCommand("sp_get_certificates_requested_sessions", con)
                    {
                        CommandType = CommandType.StoredProcedure
                    };

                    using (var reader = cmd.ExecuteReader())
                    {
                        var sessions = new List<SessionResponseRC>();

                        // Leer las sesiones que solicitaron constancias
                        while (reader.Read())
                        {
                            var session = new SessionResponseRC
                            {
                                SessionId = reader.GetInt32("session_id"),
                                CourseId = reader.GetInt32("course_id"),
                                CourseName = reader.GetString("course_name"),
                                CourseKey = reader.IsDBNull("course_key") ? null : reader.GetString("course_key"),
                                Period = reader.GetString("period"),
                                NumberOfParticipants = reader.GetInt32("number_of_participants"),
                                NumberOfCertificates = reader.GetInt32("number_of_certificates"),
                                Cost = reader.GetDecimal("cost"),
                                Status = reader.GetString("status"),
                                CertificatesRequested = reader.GetBoolean("certificates_requested"),
                                CertificatesDelivered = reader.GetBoolean("certificates_delivered"),
                                CreatedAt = reader.GetDateTime("created_at"),
                                Documents = new List<DocumentResponse>()
                            };

                            sessions.Add(session);
                        }

                        // Pasar al siguiente conjunto de resultados (documentos de cada sesión)
                        reader.NextResult();
                        while (reader.Read())
                        {
                            int sessionId = reader.GetInt32("session_id");
                            var session = sessions.FirstOrDefault(s => s.SessionId == sessionId);
                            if (session != null)
                            {
                                session.Documents.Add(new DocumentResponse
                                {
                                    DocumentId = reader.GetInt32("document_id"),
                                    Name = reader.GetString("document_name"),
                                    FilePath = reader.GetString("filePath")
                                });
                            }
                        }

                        return sessions;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return null;
            }
        }

        public object GetCertificateOfficialLetter(int sessionId)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    string query = @"
                SELECT 
                    id,
                    session_id,
                    filePath,
                    uploaded_at
                FROM session_certificate_official_letter 
                WHERE session_id = @sessionId
                LIMIT 1";

                    using (var cmd = new MySqlCommand(query, con))
                    {
                        cmd.Parameters.AddWithValue("@sessionId", sessionId);
                        con.Open();

                        using (var reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                return new
                                {
                                    Id = reader.GetInt32("id"),
                                    SessionId = reader.GetInt32("session_id"),
                                    FilePath = reader.GetString("filePath"),
                                    UploadedAt = reader.GetDateTime("uploaded_at")
                                };
                            }
                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                throw;
            }
        }

        public (int statusCode, string message) AddCenter(CenterDTO dto)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();
                    var cmd = new MySqlCommand("sp_add_center", con)
                    {
                        CommandType = CommandType.StoredProcedure
                    };

                    cmd.Parameters.AddWithValue("p_name", dto.Name);
                    cmd.Parameters.AddWithValue("p_type", dto.Type);
                    cmd.Parameters.AddWithValue("p_identifier", dto.Identifier);
                    cmd.Parameters.AddWithValue("p_director_full_name",
                        !string.IsNullOrEmpty(dto.DirectorFullName) ? dto.DirectorFullName : DBNull.Value);
                    cmd.Parameters.AddWithValue("p_academic_title",
                        !string.IsNullOrEmpty(dto.AcademicTitle) ? dto.AcademicTitle : DBNull.Value);
                    cmd.Parameters.AddWithValue("p_gender",
                        !string.IsNullOrEmpty(dto.Gender) ? dto.Gender : DBNull.Value);

                    var statusCodeParam = new MySqlParameter("p_status_code", MySqlDbType.Int32)
                    {
                        Direction = ParameterDirection.Output
                    };
                    var messageParam = new MySqlParameter("p_message", MySqlDbType.VarChar, 255)
                    {
                        Direction = ParameterDirection.Output
                    };

                    cmd.Parameters.Add(statusCodeParam);
                    cmd.Parameters.Add(messageParam);

                    cmd.ExecuteNonQuery();

                    return (Convert.ToInt32(statusCodeParam.Value), messageParam.Value.ToString());
                }
            }
            catch (Exception ex)
            {
                // Manejo de la excepción
                return (-1, $"Error interno del servidor: {ex.Message}");
            }
        }

        public (int statusCode, string message) UpdateCenter(CenterDTO dto)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();
                    var cmd = new MySqlCommand("sp_update_center", con)
                    {
                        CommandType = CommandType.StoredProcedure
                    };

                    cmd.Parameters.AddWithValue("p_center_id", dto.Id);
                    cmd.Parameters.AddWithValue("p_name", dto.Name);
                    cmd.Parameters.AddWithValue("p_type", dto.Type);
                    cmd.Parameters.AddWithValue("p_identifier", dto.Identifier);
                    cmd.Parameters.AddWithValue("p_director_full_name",
                        !string.IsNullOrEmpty(dto.DirectorFullName) ? dto.DirectorFullName : DBNull.Value);
                    cmd.Parameters.AddWithValue("p_academic_title",
                        !string.IsNullOrEmpty(dto.AcademicTitle) ? dto.AcademicTitle : DBNull.Value);
                    cmd.Parameters.AddWithValue("p_gender",
                        !string.IsNullOrEmpty(dto.Gender) ? dto.Gender : DBNull.Value);

                    var statusCodeParam = new MySqlParameter("p_status_code", MySqlDbType.Int32)
                    {
                        Direction = ParameterDirection.Output
                    };
                    var messageParam = new MySqlParameter("p_message", MySqlDbType.VarChar, 255)
                    {
                        Direction = ParameterDirection.Output
                    };

                    cmd.Parameters.Add(statusCodeParam);
                    cmd.Parameters.Add(messageParam);

                    cmd.ExecuteNonQuery();

                    return (Convert.ToInt32(statusCodeParam.Value), messageParam.Value.ToString());
                }
            }
            catch (Exception ex)
            {
                // Manejo de la excepción
                return (-1, $"Error interno del servidor: {ex.Message}");
            }
        }

        public List<CenterDTO> GetAllCenters()
        {
            var centers = new List<CenterDTO>();
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();
                    using (var cmd = new MySqlCommand("sp_get_all_centers", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                var center = new CenterDTO
                                {
                                    Id = reader.GetInt32("id"),
                                    Name = reader.GetString("name"),
                                    Type = reader.GetString("type"),
                                    Identifier = reader.GetInt32("identifier")
                                };

                                if (!reader.IsDBNull(reader.GetOrdinal("director_full_name")))
                                    center.DirectorFullName = reader.GetString("director_full_name");

                                if (!reader.IsDBNull(reader.GetOrdinal("academic_title")))
                                    center.AcademicTitle = reader.GetString("academic_title");

                                if (!reader.IsDBNull(reader.GetOrdinal("gender")))
                                    center.Gender = reader.GetString("gender");

                                centers.Add(center);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // Manejo de la excepción
                Console.WriteLine($"Error: {ex.Message}");
            }
            return centers;
        }
        public (int statusCode, string message) RequestDiplomaRegistration(DiplomaRegistrationRequest request)
        {
            try
            {
                using (MySqlConnection con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    using (MySqlCommand cmd = new MySqlCommand("sp_request_diploma_registration", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("p_username", request.Username);

                        // Convertir la documentación a JSON
                        var documentation = JsonConvert.SerializeObject(request.Documents.Select(d => new
                        {
                            document_id = d.DocumentId,
                            filePath = Path.Combine("assets", "files", "diploma-documentation", request.FolderName, d.File.FileName)
                        }));
                        cmd.Parameters.AddWithValue("p_documentation", documentation);
                        cmd.Parameters.AddWithValue("p_documentation_folder", request.FolderName);


                        cmd.Parameters.Add("p_status_code", MySqlDbType.Int32);
                        cmd.Parameters["p_status_code"].Direction = ParameterDirection.Output;
                        cmd.Parameters.Add("p_message", MySqlDbType.VarChar, 255);
                        cmd.Parameters["p_message"].Direction = ParameterDirection.Output;

                        con.Open();
                        cmd.ExecuteNonQuery();

                        var statusCode = Convert.ToInt32(cmd.Parameters["p_status_code"].Value);
                        var message = cmd.Parameters["p_message"].Value.ToString();

                        return (statusCode, message);
                    }
                }
            }
            catch (Exception ex)
            {
                return (-1, $"Error: {ex.Message}");
            }
        }

        public (int statusCode, string message) RegisterDiploma(DiplomaApprovalDTO request)
        {
            try
            {
                using (MySqlConnection con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    using (MySqlCommand cmd = new MySqlCommand("sp_register_diploma", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("p_name", request.Name);
                        cmd.Parameters.AddWithValue("p_total_duration", request.TotalDuration);
                        cmd.Parameters.AddWithValue("p_diploma_key", request.DiplomaKey);
                        cmd.Parameters.AddWithValue("p_service_type", request.ServiceType);
                        cmd.Parameters.AddWithValue("p_modality", request.Modality);
                        cmd.Parameters.AddWithValue("p_educational_offer", request.EducationalOffer);
                        cmd.Parameters.AddWithValue("p_cost", request.Cost);
                        cmd.Parameters.AddWithValue("p_participants", request.Participants);
                        cmd.Parameters.AddWithValue("p_start_date", request.StartDate);
                        cmd.Parameters.AddWithValue("p_end_date", request.EndDate);
                        cmd.Parameters.AddWithValue("p_expiration_date", request.ExpirationDate);
                        cmd.Parameters.AddWithValue("p_username", request.Username);

                        var actorRolesJson = JsonConvert.SerializeObject(request.ActorRoles);
                        cmd.Parameters.AddWithValue("p_actor_roles", actorRolesJson);

                        cmd.Parameters.Add("p_status_code", MySqlDbType.Int32);
                        cmd.Parameters["p_status_code"].Direction = ParameterDirection.Output;
                        cmd.Parameters.Add("p_message", MySqlDbType.VarChar, 255);
                        cmd.Parameters["p_message"].Direction = ParameterDirection.Output;

                        con.Open();
                        cmd.ExecuteNonQuery();

                        var statusCode = Convert.ToInt32(cmd.Parameters["p_status_code"].Value);
                        var message = cmd.Parameters["p_message"].Value.ToString();

                        return (statusCode, message);
                    }
                }
            }
            catch (Exception ex)
            {
                return (-1, $"Error: {ex.Message}");
            }
        }

        public List<DiplomaFullDataDTO> GetAllDiplomas()
        {
            var diplomas = new List<DiplomaFullDataDTO>();
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    using (var cmd = new MySqlCommand("sp_get_all_diplomas", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        con.Open();

                        using (var reader = cmd.ExecuteReader())
                        {
                            // 1. Primer resultset: datos principales
                            var diplomaMap = new Dictionary<int, DiplomaFullDataDTO>();
                            while (reader.Read())
                            {
                                int diplomaId = reader.GetInt32("diploma_id");
                                var dto = new DiplomaFullDataDTO
                                {
                                    DiplomaId = diplomaId,
                                    Name = reader.IsDBNull(reader.GetOrdinal("name")) ? null : reader.GetString("name"),
                                    TotalDuration = reader.IsDBNull(reader.GetOrdinal("total_duration")) ? 0 : reader.GetInt32("total_duration"),
                                    DiplomaKey = reader.IsDBNull(reader.GetOrdinal("diploma_key")) ? null : reader.GetString("diploma_key"),
                                    ServiceType = reader.IsDBNull(reader.GetOrdinal("service_type")) ? null : reader.GetString("service_type"),
                                    Modality = reader.IsDBNull(reader.GetOrdinal("modality")) ? null : reader.GetString("modality"),
                                    EducationalOffer = reader.IsDBNull(reader.GetOrdinal("educational_offer")) ? null : reader.GetString("educational_offer"),
                                    Status = reader.IsDBNull(reader.GetOrdinal("status")) ? null : reader.GetString("status"),
                                    ApprovalStatus = reader.IsDBNull(reader.GetOrdinal("approval_status")) ? null : reader.GetString("approval_status"),
                                    VerificationStatus = reader.IsDBNull(reader.GetOrdinal("verification_status")) ? null : reader.GetString("verification_status"),
                                    Cost = reader.IsDBNull(reader.GetOrdinal("cost")) ? 0 : reader.GetDecimal("cost"),
                                    Participants = reader.IsDBNull(reader.GetOrdinal("participants")) ? 0 : reader.GetInt32("participants"),
                                    StartDate = reader.IsDBNull(reader.GetOrdinal("start_date")) ? null : reader.GetDateTime("start_date"),
                                    EndDate = reader.IsDBNull(reader.GetOrdinal("end_date")) ? null : reader.GetDateTime("end_date"),
                                    ExpirationDate = reader.IsDBNull(reader.GetOrdinal("expiration_date")) ? null : reader.GetDateTime("expiration_date"),
                                    Center = reader.GetString("center"),
                                    CreatedAt = reader.GetDateTime("created_at"),
                                    UpdatedAt = reader.GetDateTime("updated_at"),
                                    RegisteredBy = reader.IsDBNull(reader.GetOrdinal("registered_by")) ? null : reader.GetString("registered_by"),
                                    FolderName = reader.IsDBNull(reader.GetOrdinal("documentation_folder")) ? null : reader.GetString("documentation_folder"),
                                    Actors = new List<DiplomaActorDTO>(),
                                    Documentation = new List<DiplomaDocumentationDTO>()
                                };
                                diplomaMap[diplomaId] = dto;
                            }

                            // 2. Segundo resultset: actores y roles
                            if (reader.NextResult())
                            {
                                while (reader.Read())
                                {
                                    int diplomaId = reader.GetInt32("diploma_id");
                                    if (diplomaMap.TryGetValue(diplomaId, out var diploma))
                                    {
                                        diploma.Actors.Add(new DiplomaActorDTO
                                        {
                                            ActorId = reader.GetInt32("actor_id"),
                                            Name = reader.IsDBNull(reader.GetOrdinal("actor_name")) ? "" : reader.GetString("actor_name"),
                                            Role = reader.IsDBNull(reader.GetOrdinal("role")) ? "" : reader.GetString("role")
                                        });
                                    }
                                }
                            }

                            // 3. Tercer resultset: documentación
                            if (reader.NextResult())
                            {
                                while (reader.Read())
                                {
                                    int diplomaId = reader.GetInt32("diploma_id");
                                    if (diplomaMap.TryGetValue(diplomaId, out var diploma))
                                    {
                                        diploma.Documentation.Add(new DiplomaDocumentationDTO
                                        {
                                            DocumentId = reader.GetInt32("document_id"),
                                            Name = reader.IsDBNull(reader.GetOrdinal("document_name")) ? "" : reader.GetString("document_name"),
                                            FilePath = reader.IsDBNull(reader.GetOrdinal("filePath")) ? "" : reader.GetString("filePath"),
                                            UploadedAt = DateTime.Now // Asigna la fecha según tu lógica
                                        });
                                    }
                                }
                            }

                            diplomas = diplomaMap.Values.ToList();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
            return diplomas;
        }

        public async Task<(int statusCode, string message)> RegisterDiplomaRejectionMessage(
            int diplomaId,
            string username,
            string center,
            string rejectionType,
            string subject,
            string adminNotes = null,
            string verificationNotes = null)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    await con.OpenAsync();

                    // Primero, obtener el user_id
                    int userId = 0;
                    var userQuery = "SELECT id FROM users WHERE username = @username LIMIT 1";
                    using (var userCmd = new MySqlCommand(userQuery, con))
                    {
                        userCmd.Parameters.AddWithValue("@username", username);
                        var result = await userCmd.ExecuteScalarAsync();
                        if (result != null)
                        {
                            userId = Convert.ToInt32(result);
                        }
                        else
                        {
                            return (0, "Usuario no encontrado");
                        }
                    }

                    // Ahora insertar el mensaje de rechazo
                    var query = @"
                INSERT INTO rejection_messages (
                    user_name, 
                    user_id, 
                    center_name, 
                    rejection_type, 
                    subject, 
                    admin_notes, 
                    verification_notes
                ) VALUES (
                    @userName,
                    @userId,
                    @centerName,
                    @rejectionType,
                    @subject,
                    @adminNotes,
                    @verificationNotes
                )";

                    using (var cmd = new MySqlCommand(query, con))
                    {
                        cmd.Parameters.AddWithValue("@userName", username);
                        cmd.Parameters.AddWithValue("@userId", userId);
                        cmd.Parameters.AddWithValue("@centerName", center);
                        cmd.Parameters.AddWithValue("@rejectionType", rejectionType);
                        cmd.Parameters.AddWithValue("@subject", subject);
                        cmd.Parameters.AddWithValue("@adminNotes", adminNotes ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@verificationNotes", verificationNotes ?? (object)DBNull.Value);

                        await cmd.ExecuteNonQueryAsync();
                        return (1, "Mensaje de rechazo registrado exitosamente");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en RegisterDiplomaRejectionMessage: {ex.Message}");
                return (0, $"Error al registrar mensaje de rechazo: {ex.Message}");
            }
        }

        public async Task<string> GetDiplomaFolder(int diplomaId)
        {
            using (var con = new MySqlConnection(_config.GetConnectionString("default")))
            {
                await con.OpenAsync();
                string query = "SELECT documentation_folder FROM diplomas WHERE id = @diplomaId";
                using (var cmd = new MySqlCommand(query, con))
                {
                    cmd.Parameters.AddWithValue("@diplomaId", diplomaId);
                    return (await cmd.ExecuteScalarAsync())?.ToString();
                }
            }
        }

        public async Task<(int statusCode, string message)> DeleteDiploma(
     int diplomaId,
     string username = null,
     string center = null,
     string rejectionType = null,
     string subject = null,
     string adminNotes = null,
     string verificationNotes = null)
        {
            using (var con = new MySqlConnection(_config.GetConnectionString("default")))
            {
                await con.OpenAsync();

                // Primero, obtener información del diplomado antes de eliminarlo (si es necesario)
                string diplomaName = "";
                if (!string.IsNullOrEmpty(username) && string.IsNullOrEmpty(subject))
                {
                    var getNameCmd = new MySqlCommand("SELECT name FROM diplomas WHERE id = @diplomaId", con);
                    getNameCmd.Parameters.AddWithValue("@diplomaId", diplomaId);
                    var nameResult = await getNameCmd.ExecuteScalarAsync();
                    if (nameResult != null)
                    {
                        diplomaName = nameResult.ToString();
                    }
                }

                // Eliminar el diplomado
                using (var cmd = new MySqlCommand("DELETE FROM diplomas WHERE id = @diplomaId", con))
                {
                    cmd.Parameters.AddWithValue("@diplomaId", diplomaId);
                    await cmd.ExecuteNonQueryAsync();

                    // Si se proporcionaron datos para el mensaje de rechazo, registrarlo
                    if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(center) && !string.IsNullOrEmpty(rejectionType))
                    {
                        await RegisterDiplomaRejectionMessage(
                            diplomaId,
                            username,
                            center,
                            rejectionType,
                            subject ?? diplomaName,
                            adminNotes,
                            verificationNotes
                        );
                    }

                    return (1, "Solicitud de diplomado rechazada y eliminada exitosamente.");
                }
            }
        }

        public async Task<(int statusCode, string message)> ApproveDiplomaRequest(DiplomaApprovalRequest request)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    await con.OpenAsync();
                    using (var cmd = new MySqlCommand("sp_approve_diploma_request", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("p_diploma_id", request.DiplomaId);
                        cmd.Parameters.AddWithValue("p_name", request.Name);
                        cmd.Parameters.AddWithValue("p_total_duration", request.TotalDuration);
                        cmd.Parameters.AddWithValue("p_diploma_key", request.DiplomaKey);
                        cmd.Parameters.AddWithValue("p_service_type", request.ServiceType);
                        cmd.Parameters.AddWithValue("p_modality", request.Modality);
                        cmd.Parameters.AddWithValue("p_educational_offer", request.EducationalOffer);
                        cmd.Parameters.AddWithValue("p_cost", request.Cost);
                        cmd.Parameters.AddWithValue("p_participants", request.Participants);
                        cmd.Parameters.AddWithValue("p_start_date", request.StartDate);
                        cmd.Parameters.AddWithValue("p_end_date", request.EndDate);
                        cmd.Parameters.AddWithValue("p_username", request.Username);
                        cmd.Parameters.AddWithValue("p_expiration_date", request.ExpirationDate);

                        var actorRolesJson = JsonConvert.SerializeObject(request.ActorRoles.Select(a => new
                        {
                            actor_id = a.ActorId,
                            role = a.Role
                        }));

                        cmd.Parameters.AddWithValue("p_actor_roles", actorRolesJson);

                        var statusCodeParam = new MySqlParameter("p_status_code", MySqlDbType.Int32) { Direction = ParameterDirection.Output };
                        var messageParam = new MySqlParameter("p_message", MySqlDbType.VarChar, 255) { Direction = ParameterDirection.Output };

                        cmd.Parameters.Add(statusCodeParam);
                        cmd.Parameters.Add(messageParam);

                        await cmd.ExecuteNonQueryAsync();

                        return (Convert.ToInt32(statusCodeParam.Value), messageParam.Value.ToString());
                    }
                }
            }
            catch (Exception ex)
            {
                return (-1, $"Error: {ex.Message}");
            }
        }

        public List<DiplomaFullDataDTO> GetDiplomasByCenter(string center)
        {
            var diplomas = new List<DiplomaFullDataDTO>();
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    using (var cmd = new MySqlCommand("sp_get_diplomas_by_center", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("p_center", center);
                        con.Open();

                        using (var reader = cmd.ExecuteReader())
                        {
                            var diplomaMap = new Dictionary<int, DiplomaFullDataDTO>();

                            // Primer resultset: datos principales
                            while (reader.Read())
                            {
                                var diploma = new DiplomaFullDataDTO
                                {
                                    DiplomaId = reader.GetInt32("diploma_id"),
                                    Name = reader.IsDBNull("name") ? null : reader.GetString("name"),
                                    TotalDuration = reader.IsDBNull("total_duration") ? (int?)null : reader.GetInt32("total_duration"),
                                    DiplomaKey = reader.IsDBNull("diploma_key") ? null : reader.GetString("diploma_key"),
                                    ServiceType = reader.IsDBNull("service_type") ? null : reader.GetString("service_type"),
                                    Modality = reader.IsDBNull("modality") ? null : reader.GetString("modality"),
                                    EducationalOffer = reader.IsDBNull("educational_offer") ? null : reader.GetString("educational_offer"),
                                    Status = reader.IsDBNull("status") ? null : reader.GetString("status"),
                                    ApprovalStatus = reader.IsDBNull("approval_status") ? null : reader.GetString("approval_status"),
                                    VerificationStatus = reader.IsDBNull("verification_status") ? null : reader.GetString("verification_status"),
                                    Cost = reader.IsDBNull("cost") ? null : reader.GetDecimal("cost"),
                                    Participants = reader.IsDBNull("participants") ? (int?)null : reader.GetInt32("participants"),
                                    StartDate = reader.IsDBNull("start_date") ? null : reader.GetDateTime("start_date"),
                                    EndDate = reader.IsDBNull("end_date") ? null : reader.GetDateTime("end_date"),
                                    ExpirationDate = reader.IsDBNull("expiration_date") ? null : reader.GetDateTime("expiration_date"),
                                    Center = reader.GetString("center"),
                                    CreatedAt = reader.GetDateTime("created_at"),
                                    UpdatedAt = reader.GetDateTime("updated_at"),
                                    RegisteredBy = reader.IsDBNull("registered_by") ? null : reader.GetString("registered_by"),
                                    FolderName = reader.IsDBNull("documentation_folder") ? null : reader.GetString("documentation_folder"),
                                };
                                diplomaMap[diploma.DiplomaId.Value] = diploma;
                            }

                            // Segundo resultset: actores y roles
                            if (reader.NextResult())
                            {
                                while (reader.Read())
                                {
                                    var diplomaId = reader.GetInt32("diploma_id");
                                    if (diplomaMap.TryGetValue(diplomaId, out var diploma))
                                    {
                                        diploma.Actors.Add(new DiplomaActorDTO
                                        {
                                            ActorId = reader.GetInt32("actor_id"),
                                            Name = reader.GetString("actor_name"),
                                            Role = reader.GetString("role")
                                        });
                                    }
                                }
                            }

                            // Tercer resultset: documentación
                            if (reader.NextResult())
                            {
                                while (reader.Read())
                                {
                                    var diplomaId = reader.GetInt32("diploma_id");
                                    if (diplomaMap.TryGetValue(diplomaId, out var diploma))
                                    {
                                        diploma.Documentation.Add(new DiplomaDocumentationDTO
                                        {
                                            DocumentId = reader.GetInt32("document_id"),
                                            Name = reader.GetString("document_name"),
                                            FilePath = reader.IsDBNull("filePath") ? null : reader.GetString("filePath"),
                                            UploadedAt = reader.IsDBNull("uploaded_at") ? DateTime.MinValue : reader.GetDateTime("uploaded_at")
                                        });
                                    }
                                }
                            }

                            diplomas = diplomaMap.Values.ToList();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al obtener diplomados por centro: {ex.Message}");
            }
            return diplomas;
        }

        public async Task<(int statusCode, string message)> UpdateDiplomaVerificationStatus(int diplomaId, string verificationStatus, string? verificationNotes = null)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    await con.OpenAsync();

                    using (var cmd = new MySqlCommand(@"
                UPDATE diplomas
                SET verification_status = @verificationStatus,
                    verification_notes = @verificationNotes
                WHERE id = @diplomaId", con))
                    {
                        cmd.Parameters.AddWithValue("@verificationStatus", verificationStatus);
                        cmd.Parameters.AddWithValue("@verificationNotes", verificationNotes ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@diplomaId", diplomaId);

                        int affectedRows = await cmd.ExecuteNonQueryAsync();

                        return affectedRows > 0
                            ? (1, "Diplomado verificado exitosamente.")
                            : (0, "No se encontró el diplomado.");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en UpdateDiplomaVerificationStatus: {ex.Message}");
                return (0, "Error al actualizar el estado de verificación del diplomado.");
            }
        }


        public List<CompletedDiplomaDTO> GetCompletedDiplomas(string username)
        {
            var diplomas = new List<CompletedDiplomaDTO>();
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    using (var cmd = new MySqlCommand("sp_get_completed_diplomas", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("p_username", username);

                        con.Open();
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                diplomas.Add(new CompletedDiplomaDTO
                                {
                                    DiplomaId = reader.GetInt32("diplomaId"),
                                    Title = reader.GetString("title"),
                                    DiplomaKey = reader.GetString("clave"),
                                    StartDate = reader.GetDateTime("startDate").ToString("dd/MM/yyyy"),
                                    EndDate = reader.GetDateTime("endDate").ToString("dd/MM/yyyy"),
                                    CertificatesRequested = reader.GetBoolean("certificates_requested"),
                                    CertificatesDelivered = reader.GetBoolean("certificates_delivered")
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
            return diplomas;
        }

        public (int statusCode, string message) RequestDiplomaCertificates(DiplomaCertificateRequestDTO request)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    using (var cmd = new MySqlCommand("sp_request_diploma_certificates", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("p_diploma_id", request.DiplomaId);

                        // Convertir la documentación a JSON
                        var documentationJson = JsonConvert.SerializeObject(request.Documents.Select(d => new
                        {
                            document_id = d.DocumentId,
                            filePath = Path.Combine("assets", "files", "request-diploma-certificates-documentation", request.FolderName, d.File.FileName)
                        }));

                        cmd.Parameters.AddWithValue("p_documentation", documentationJson);

                        // Parámetros de salida
                        var statusCodeParam = new MySqlParameter("p_status_code", MySqlDbType.Int32)
                        {
                            Direction = ParameterDirection.Output
                        };
                        var messageParam = new MySqlParameter("p_message", MySqlDbType.VarChar, 255)
                        {
                            Direction = ParameterDirection.Output
                        };

                        cmd.Parameters.Add(statusCodeParam);
                        cmd.Parameters.Add(messageParam);

                        con.Open();
                        cmd.ExecuteNonQuery();

                        return (
                            Convert.ToInt32(statusCodeParam.Value),
                            messageParam.Value.ToString()
                        );
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return (-1, "Error interno del servidor");
            }
        }

        public (int statusCode, string message) UploadDiplomaDocument(int diplomaId, int documentId, string filePath)
        {
            using (var con = new MySqlConnection(_config.GetConnectionString("default")))
            {
                con.Open();
                using (var cmd = new MySqlCommand("sp_upload_diploma_document", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("p_diploma_id", diplomaId);
                    cmd.Parameters.AddWithValue("p_document_id", documentId);
                    cmd.Parameters.AddWithValue("p_file_path", filePath);

                    var statusParam = new MySqlParameter("p_status_code", MySqlDbType.Int32)
                    { Direction = ParameterDirection.Output };
                    var messageParam = new MySqlParameter("p_message", MySqlDbType.VarChar, 255)
                    { Direction = ParameterDirection.Output };

                    cmd.Parameters.Add(statusParam);
                    cmd.Parameters.Add(messageParam);

                    cmd.ExecuteNonQuery();

                    return (Convert.ToInt32(statusParam.Value), messageParam.Value.ToString());
                }
            }
        }

        public async Task<(int statusCode, string message)> UploadDiplomaOfficialLetter(int diplomaId, string filePath, int numberOfCertificates)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    await con.OpenAsync();

                    using (var cmd = new MySqlCommand("sp_upload_diploma_official_letter", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("p_diploma_id", diplomaId);
                        cmd.Parameters.AddWithValue("p_file_path", filePath);
                        cmd.Parameters.AddWithValue("p_number_of_certificates", numberOfCertificates);

                        var p_status_code = new MySqlParameter("p_status_code", MySqlDbType.Int32) { Direction = ParameterDirection.Output };
                        var p_message = new MySqlParameter("p_message", MySqlDbType.VarChar, 255) { Direction = ParameterDirection.Output };

                        cmd.Parameters.Add(p_status_code);
                        cmd.Parameters.Add(p_message);

                        await cmd.ExecuteNonQueryAsync();

                        return (Convert.ToInt32(p_status_code.Value), p_message.Value.ToString());
                    }
                }
            }
            catch (Exception ex)
            {
                return (-1, $"Error: {ex.Message}");
            }
        }


        public List<DiplomaCertificateRequestModel> GetRequestedDiplomaCertificates()
        {
            var requestsDict = new Dictionary<int, DiplomaCertificateRequestModel>();
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();
                    using (var cmd = new MySqlCommand("sp_get_requested_diploma_certificates", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        using (var reader = cmd.ExecuteReader())
                        {
                            // Primer resultset: Datos generales del diplomado
                            while (reader.Read())
                            {
                                var diplomaId = reader.GetInt32("diploma_id");
                                if (!requestsDict.ContainsKey(diplomaId))
                                {
                                    requestsDict[diplomaId] = new DiplomaCertificateRequestModel
                                    {
                                        DiplomaId = diplomaId,
                                        Title = reader.GetString("title"),
                                        Period = reader.GetString("period"),
                                        NumberOfCertificates = reader.GetInt32("number_of_certificates"),
                                        Status = reader.GetString("status"),
                                        Documents = new List<DiplomaCertificateDocumentModel>()
                                    };
                                }
                            }

                            // Segundo resultset (si lo usas) para cargar documentos
                            if (reader.NextResult())
                            {
                                while (reader.Read())
                                {
                                    var diplomaId = reader.GetInt32("diploma_id");
                                    if (requestsDict.TryGetValue(diplomaId, out var request))
                                    {
                                        request.Documents.Add(new DiplomaCertificateDocumentModel
                                        {
                                            DocumentId = reader.GetInt32("document_id"),
                                            Name = reader.GetString("name"),  // Cambiado de "name" a "document_name"
                                            FilePath = reader.GetString("file_path"),   // Cambiado de "file_path" a "filePath"
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // Manejo de errores
                Console.WriteLine(ex.Message);
                return new List<DiplomaCertificateRequestModel>();
            }

            return requestsDict.Values.ToList();
        }


        public object GetDiplomaCertificateOfficialLetter(int diplomaId)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    string query = @"
                SELECT 
                    id,
                    diploma_id,
                    filePath,
                    uploaded_at
                FROM diploma_official_letter 
                WHERE diploma_id = @diplomaId
                LIMIT 1";

                    using (var cmd = new MySqlCommand(query, con))
                    {
                        cmd.Parameters.AddWithValue("@diplomaId", diplomaId);
                        con.Open();

                        using (var reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                return new
                                {
                                    Id = reader.GetInt32("id"),
                                    DiplomaId = reader.GetInt32("diploma_id"),
                                    FilePath = reader.GetString("filePath"),
                                    UploadedAt = reader.GetDateTime("uploaded_at")
                                };
                            }
                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                throw;
            }
        }

        public (int statusCode, string message) InsertMessage(ContactMessageDTO message)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    using (var cmd = new MySqlCommand("sp_insert_message", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        // Parámetros de entrada
                        cmd.Parameters.AddWithValue("p_name", message.Name);
                        cmd.Parameters.AddWithValue("p_email", message.Email);
                        cmd.Parameters.AddWithValue("p_subject", message.Subject);
                        cmd.Parameters.AddWithValue("p_message", message.Message);

                        // Parámetros de salida
                        var statusCodeParam = new MySqlParameter("p_status_code", MySqlDbType.Int32)
                        { Direction = ParameterDirection.Output };
                        var messageParam = new MySqlParameter("p_response_message", MySqlDbType.VarChar, 255)
                        { Direction = ParameterDirection.Output };

                        cmd.Parameters.Add(statusCodeParam);
                        cmd.Parameters.Add(messageParam);

                        con.Open();
                        cmd.ExecuteNonQuery();

                        return (
                            Convert.ToInt32(statusCodeParam.Value),
                            messageParam.Value.ToString() ?? "Mensaje enviado con éxito"
                        );
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return (-1, "Error al procesar el mensaje");
            }
        }

        public List<MessageDTO> GetAllMessages()
        {
            var messages = new List<MessageDTO>();
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    using (var cmd = new MySqlCommand("sp_get_all_messages", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        con.Open();

                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                messages.Add(new MessageDTO
                                {
                                    Id = reader.GetInt32("id"),
                                    Name = reader.GetString("name"),
                                    Email = reader.GetString("email"),
                                    Subject = reader.GetString("subject"),
                                    Message = reader.GetString("message"),
                                    SentAt = reader.GetDateTime("sent_at"),
                                    Attended = reader.GetBoolean("attended"),
                                    AttendedAt = reader.IsDBNull(reader.GetOrdinal("attended_at")) ? null : reader.GetDateTime("attended_at"),
                                    AttendedByName = reader.IsDBNull(reader.GetOrdinal("attended_by_name")) ? null : reader.GetString("attended_by_name")
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
            return messages;
        }

        public (int statusCode, string message) UpdateMessageStatus(MessageUpdateDTO update)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    using (var cmd = new MySqlCommand("sp_update_message_status", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        // Parámetros de entrada
                        cmd.Parameters.AddWithValue("p_id", update.Id);
                        cmd.Parameters.AddWithValue("p_attended", update.Attended);
                        cmd.Parameters.AddWithValue("p_attended_by_username", update.AttendedBy);

                        // Parámetros de salida
                        var statusCodeParam = new MySqlParameter("p_status_code", MySqlDbType.Int32)
                        { Direction = ParameterDirection.Output };
                        var messageParam = new MySqlParameter("p_response_message", MySqlDbType.VarChar, 255)
                        { Direction = ParameterDirection.Output };

                        cmd.Parameters.Add(statusCodeParam);
                        cmd.Parameters.Add(messageParam);

                        con.Open();
                        cmd.ExecuteNonQuery();

                        return (
                            Convert.ToInt32(statusCodeParam.Value),
                            messageParam.Value?.ToString() ?? "Mensaje actualizado con éxito"
                        );
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return (-1, "Error al actualizar el mensaje");
            }
        }

        public List<UserDTO> GetAllUsers()
        {
            var users = new List<UserDTO>();
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    using (var cmd = new MySqlCommand(@"
                SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.second_last_name, 
                       c.name as center_name, u.role, u.created_at
                FROM users u
                LEFT JOIN centers c ON u.center_id = c.id
                ORDER BY u.created_at DESC", con))
                    {
                        con.Open();
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                users.Add(new UserDTO
                                {
                                    Id = reader.GetInt32("id"),
                                    Username = reader.GetString("username"),
                                    Email = reader.GetString("email"),
                                    FirstName = reader.GetString("first_name"),
                                    LastName = reader.GetString("last_name"),
                                    SecondLastName = reader.IsDBNull("second_last_name") ? null : reader.GetString("second_last_name"),
                                    CenterName = reader.IsDBNull("center_name") ? null : reader.GetString("center_name"),
                                    Role = reader.GetString("role"),
                                    CreatedAt = reader.GetDateTime("created_at")
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
            return users;
        }

        public (int statusCode, string message) CreateUser(RegistrationRequest user)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    using (var cmd = new MySqlCommand("sp_insert_user", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("p_username", user.Username);
                        cmd.Parameters.AddWithValue("p_email", user.Email);
                        cmd.Parameters.AddWithValue("p_password", user.Password);
                        cmd.Parameters.AddWithValue("p_first_name", user.FirstName);
                        cmd.Parameters.AddWithValue("p_last_name", user.LastName);
                        cmd.Parameters.AddWithValue("p_second_last_name", (object?)user.SecondLastName ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("p_center", (object?)user.CenterName ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("p_role", user.Role);

                        var statusCodeParam = new MySqlParameter("p_status_code", MySqlDbType.Int32)
                        { Direction = ParameterDirection.Output };
                        var messageParam = new MySqlParameter("p_message", MySqlDbType.VarChar, 255)
                        { Direction = ParameterDirection.Output };

                        cmd.Parameters.Add(statusCodeParam);
                        cmd.Parameters.Add(messageParam);

                        con.Open();
                        cmd.ExecuteNonQuery();

                        return (
                            Convert.ToInt32(statusCodeParam.Value),
                            messageParam.Value?.ToString() ?? "Usuario creado exitosamente"
                        );
                    }
                }
            }
            catch (Exception ex)
            {
                return (-1, $"Error al crear usuario: {ex.Message}");
            }
        }

        public List<InstructorFullDataDTO> GetAllInstructors()
        {
            var instructors = new List<InstructorFullDataDTO>();
            var academicHistories = new Dictionary<int, List<AcademicHistoryDTO>>();
            var professionalExperiences = new Dictionary<int, List<ProfessionalExperienceDTO>>();

            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    using (var cmd = new MySqlCommand("sp_get_all_instructors", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        con.Open();

                        using (var reader = cmd.ExecuteReader())
                        {
                            // Leer datos generales
                            while (reader.Read())
                            {
                                var instructor = new InstructorFullDataDTO
                                {
                                    Id = reader.GetInt32("id"),
                                    FirstName = reader.GetString("first_name"),
                                    LastName = reader.GetString("last_name"),
                                    SecondLastName = reader.IsDBNull("second_last_name") ? null : reader.GetString("second_last_name"),
                                    Email = reader.GetString("email"),
                                    KnowledgeArea = reader.GetString("knowledge_area"),
                                    CenterName = reader.GetString("center_name")
                                };
                                instructors.Add(instructor);
                            }

                            // Leer historial académico
                            if (reader.NextResult())
                            {
                                while (reader.Read())
                                {
                                    var academicHistory = new AcademicHistoryDTO
                                    {
                                        EducationLevel = reader.GetString("education_level"),
                                        Period = reader.GetString("period"),
                                        Institution = reader.GetString("institution"),
                                        DegreeAwarded = reader.GetString("degree_awarded"),
                                        EvidencePath = reader.GetString("evidence_path")
                                    };

                                    var actorId = reader.GetInt32("actor_id");
                                    if (!academicHistories.ContainsKey(actorId))
                                    {
                                        academicHistories[actorId] = new List<AcademicHistoryDTO>();
                                    }
                                    academicHistories[actorId].Add(academicHistory);
                                }
                            }

                            // Leer experiencia profesional
                            if (reader.NextResult())
                            {
                                while (reader.Read())
                                {
                                    var professionalExperience = new ProfessionalExperienceDTO
                                    {
                                        Period = reader.GetString("period"),
                                        Organization = reader.GetString("organization"),
                                        Position = reader.GetString("position"),
                                        Activity = reader.GetString("activity"),
                                        EvidencePath = reader.GetString("evidence_path")
                                    };

                                    var actorId = reader.GetInt32("actor_id");
                                    if (!professionalExperiences.ContainsKey(actorId))
                                    {
                                        professionalExperiences[actorId] = new List<ProfessionalExperienceDTO>();
                                    }
                                    professionalExperiences[actorId].Add(professionalExperience);
                                }
                            }
                        }
                    }
                }

                // Asignar historial académico y experiencia profesional a cada instructor
                foreach (var instructor in instructors)
                {
                    if (academicHistories.ContainsKey(instructor.Id))
                    {
                        instructor.AcademicHistories = academicHistories[instructor.Id];
                    }
                    if (professionalExperiences.ContainsKey(instructor.Id))
                    {
                        instructor.ProfessionalExperiences = professionalExperiences[instructor.Id];
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }

            return instructors;
        }

        public async Task<(int statusCode, string message)> ManageTemplate(
            string action,
            int? templateId,
            string type,
            string name,
            string filePath,
            string docType,
            bool required,
            List<string>? modalities)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    await con.OpenAsync();

                    using (var cmd = new MySqlCommand("sp_manage_template", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.Add(new MySqlParameter("p_action", MySqlDbType.VarChar) { Value = action });
                        cmd.Parameters.Add(new MySqlParameter("p_template_id", MySqlDbType.Int32) { Value = (object)templateId ?? DBNull.Value });
                        cmd.Parameters.Add(new MySqlParameter("p_type", MySqlDbType.VarChar) { Value = type });
                        cmd.Parameters.Add(new MySqlParameter("p_name", MySqlDbType.VarChar) { Value = name });
                        cmd.Parameters.Add(new MySqlParameter("p_file_path", MySqlDbType.VarChar) { Value = filePath });
                        cmd.Parameters.Add(new MySqlParameter("p_doc_type", MySqlDbType.VarChar) { Value = docType });
                        cmd.Parameters.Add(new MySqlParameter("p_required", MySqlDbType.Bit) { Value = required });

                        // Validar y convertir modalidades al formato correcto
                        var allowedModalities = new HashSet<string> { "schooled", "non-schooled", "mixed" };
                        var filteredModalities = modalities?.Where(m => allowedModalities.Contains(m.ToLower())).ToList();

                        if (filteredModalities == null || !filteredModalities.Any())
                        {
                            cmd.Parameters.Add(new MySqlParameter("p_modalities", MySqlDbType.JSON) { Value = DBNull.Value });
                        }
                        else
                        {
                            string modalitiesJson = JsonConvert.SerializeObject(filteredModalities);
                            Console.WriteLine($"[DEBUG] JSON de modalidades enviadas: {modalitiesJson}");
                            cmd.Parameters.Add(new MySqlParameter("p_modalities", MySqlDbType.JSON) { Value = modalitiesJson });
                        }

                        var statusCodeParam = new MySqlParameter("p_status_code", MySqlDbType.Int32) { Direction = ParameterDirection.Output };
                        var messageParam = new MySqlParameter("p_message", MySqlDbType.VarChar, 255) { Direction = ParameterDirection.Output };

                        cmd.Parameters.Add(statusCodeParam);
                        cmd.Parameters.Add(messageParam);

                        await cmd.ExecuteNonQueryAsync();

                        int statusCode = Convert.ToInt32(statusCodeParam.Value);
                        string message = messageParam.Value?.ToString() ?? "Operación completada exitosamente";

                        Console.WriteLine($"[DEBUG] Status Code: {statusCode}, Message: {message}");

                        return (statusCode, message);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Error en ManageTemplate: {ex.Message}");
                return (-1, $"Error al gestionar plantilla: {ex.Message}");
            }
        }

        public object GetAllTemplates()
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();

                    var result = new
                    {
                        CourseTemplates = new List<object>(),
                        DiplomaTemplates = new List<object>(),
                        CertificateTemplates = new List<object>()
                    };

                    // Obtener plantillas de cursos con sus modalidades y required
                    using (var cmd = new MySqlCommand(@"
                SELECT 
                    t.id,
                    t.name,
                    t.filePath,
                    t.type,
                    GROUP_CONCAT(DISTINCT da.modality) as modalities,
                    MIN(da.required) as required
                FROM documents_templates t
                LEFT JOIN document_access da ON t.id = da.document_id
                GROUP BY t.id", con))
                    {
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                result.CourseTemplates.Add(new
                                {
                                    Id = reader.GetInt32("id"),
                                    Name = reader.GetString("name"),
                                    FilePath = reader.GetString("filePath"),
                                    Type = reader.GetString("type"),
                                    Required = reader.IsDBNull("required") ? false : reader.GetBoolean("required"),
                                    Modalities = reader.IsDBNull("modalities") ? new List<string>()
                                        : reader.GetString("modalities").Split(',').ToList()
                                });
                            }
                        }
                    }

                    // Obtener plantillas de diplomados
                    using (var cmd = new MySqlCommand("SELECT * FROM documents_templates_diploma", con))
                    {
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                result.DiplomaTemplates.Add(new
                                {
                                    Id = reader.GetInt32("id"),
                                    Name = reader.GetString("name"),
                                    FilePath = reader.GetString("filePath"),
                                    Type = reader.GetString("type"),
                                    Required = reader.GetBoolean("required")
                                });
                            }
                        }
                    }

                    // Obtener plantillas de certificados
                    using (var cmd = new MySqlCommand("SELECT * FROM certificate_documents_templates", con))
                    {
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                result.CertificateTemplates.Add(new
                                {
                                    Id = reader.GetInt32("id"),
                                    Name = reader.GetString("name"),
                                    FilePath = reader.IsDBNull("filePath") ? null : reader.GetString("filePath"),
                                    Type = reader.GetString("type"),
                                    Required = reader.GetBoolean("required")
                                });
                            }
                        }
                    }

                    return result;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                throw;
            }
        }

        public (int statusCode, string message) UpdateUserPassword(UpdatePasswordRequest request)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                using (var cmd = new MySqlCommand("sp_update_user_password", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("p_username", request.Username);
                    cmd.Parameters.AddWithValue("p_new_password", request.NewPassword);

                    var statusParam = new MySqlParameter("p_status_code", MySqlDbType.Int32)
                    {
                        Direction = ParameterDirection.Output
                    };
                    var messageParam = new MySqlParameter("p_message", MySqlDbType.VarChar, 255)
                    {
                        Direction = ParameterDirection.Output
                    };

                    cmd.Parameters.Add(statusParam);
                    cmd.Parameters.Add(messageParam);

                    con.Open();
                    cmd.ExecuteNonQuery();

                    return (
                        Convert.ToInt32(statusParam.Value),
                        messageParam.Value?.ToString() ?? ""
                    );
                }
            }
            catch (Exception ex)
            {
                return (-1, $"Error al actualizar contraseña: {ex.Message}");
            }
        }

        public List<TutorialVideoDTO> GetTutorialVideos()
        {
            var videos = new List<TutorialVideoDTO>();

            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    using (var cmd = new MySqlCommand("sp_get_tutorial_videos", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        con.Open();

                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                videos.Add(new TutorialVideoDTO
                                {
                                    Id = reader.GetInt32("id"),
                                    Title = reader.GetString("title"),
                                    Description = reader.GetString("description"),
                                    VideoUrl = reader.GetString("videoUrl"),
                                    ThumbnailUrl = reader.GetString("thumbnailUrl"),
                                    CreatedAt = reader.GetDateTime("createdAt")
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting tutorial videos: {ex.Message}");
                throw;
            }

            return videos;
        }

        // Agregue esto dentro de la clase DBManager

        public List<ReportCurrentVigentCourses> GetCurrentVigentCourses()
        {
            var courses = new List<ReportCurrentVigentCourses>();
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();
                    using (var cmd = new MySqlCommand("sp_get_current_vigent_courses", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                courses.Add(new ReportCurrentVigentCourses
                                {
                                    ID = reader.GetInt32("ID"),
                                    NombreDelCurso = reader.GetString("Nombre del curso"),
                                    FechaDeRegistro = reader.GetString("Fecha de registro"),
                                    Horas = reader.GetInt32("Horas"),
                                    Modalidad = reader.GetString("Modalidad"),
                                    Centro = reader.GetString("Centro"),
                                    FechaExpiracion = reader.GetString("Fecha expiración")
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetCurrentVigentCourses: {ex.Message}");
            }
            return courses;
        }

        public List<ReportCurrentVigentDiplomas> GetCurrentVigentDiplomas()
        {
            var diplomas = new List<ReportCurrentVigentDiplomas>();
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();
                    using (var cmd = new MySqlCommand("sp_get_current_vigent_diplomas", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                diplomas.Add(new ReportCurrentVigentDiplomas
                                {
                                    ID = reader.GetInt32("ID"),
                                    NombreDelDiplomado = reader.GetString("Nombre del diplomado"),
                                    FechaDeRegistro = reader.GetString("Fecha de registro"),
                                    Horas = reader.GetInt32("Horas"),
                                    Modalidad = reader.GetString("Modalidad"),
                                    Centro = reader.GetString("Centro"),
                                    FechaExpiracion = reader.GetString("Fecha expiración")
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetCurrentVigentDiplomas: {ex.Message}");
            }
            return diplomas;
        }

        public List<ReportCertificatesDeliveredSessions> GetCertificatesDeliveredSessions()
        {
            var sessions = new List<ReportCertificatesDeliveredSessions>();
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();
                    using (var cmd = new MySqlCommand("sp_get_certificates_delivered_sessions", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                sessions.Add(new ReportCertificatesDeliveredSessions
                                {
                                    ID = reader.GetInt32("ID"),
                                    ClaveDelCurso = reader.GetString("Clave del curso"),
                                    NombreDelCurso = reader.GetString("Nombre del curso"),
                                    Periodo = reader.GetString("Periodo"),
                                    ParticipantesRegistrados = reader.GetInt32("Participantes registrados"),
                                    ConstanciasEntregadas = reader.GetInt32("Constancias entregadas"),
                                    Costo = reader.GetDecimal("Costo"),
                                    FechaDeRegistro = reader.GetString("Fecha de registro"),
                                    Centro = reader.GetString("Centro"),
                                    RutaDelOficio = reader.GetString("Ruta del oficio")
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetCertificatesDeliveredSessions: {ex.Message}");
            }
            return sessions;
        }

        public List<ReportCertificatesDeliveredDiplomas> GetCertificatesDeliveredDiplomas()
        {
            var diplomas = new List<ReportCertificatesDeliveredDiplomas>();
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();
                    using (var cmd = new MySqlCommand("sp_get_certificates_delivered_diplomas", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                diplomas.Add(new ReportCertificatesDeliveredDiplomas
                                {
                                    ID = reader.GetInt32("ID"),
                                    NombreDelDiplomado = reader.GetString("Nombre del diplomado"),
                                    Clave = reader.GetString("Clave"),
                                    Horas = reader.GetInt32("Horas"),
                                    Modalidad = reader.GetString("Modalidad"),
                                    FechaInicio = reader.GetString("Fecha inicio"),
                                    FechaFin = reader.GetString("Fecha fin"),
                                    ParticipantesRegistrados = reader.GetInt32("Participantes registrados"),
                                    ConstanciasEmitidas = reader.GetInt32("Constancias emitidas"),
                                    Centro = reader.GetString("Centro"),
                                    RutaDelOficio = reader.GetString("Ruta del oficio")
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetCertificatesDeliveredDiplomas: {ex.Message}");
            }
            return diplomas;
        }

        // Métodos para el DBManager
        public List<RejectionMessageDTO> GetUserRejectionMessages(string username)
        {
            var messages = new List<RejectionMessageDTO>();
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();

                    var sql = @"
                SELECT 
                    rm.*, 
                    u.id AS user_id
                FROM 
                    rejection_messages rm
                    JOIN users u ON rm.user_name = u.username
                WHERE 
                    rm.user_name = @username
                ORDER BY 
                    rm.created_at DESC";

                    using (var cmd = new MySqlCommand(sql, con))
                    {
                        cmd.Parameters.AddWithValue("@username", username);
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                messages.Add(new RejectionMessageDTO
                                {
                                    Id = reader.GetInt32("id"),
                                    UserName = reader.GetString("user_name"),
                                    UserId = reader.GetInt32("user_id"),
                                    CenterName = reader.GetString("center_name"),
                                    RejectionType = reader.GetString("rejection_type"),
                                    Subject = reader.GetString("subject"),
                                    AdminNotes = reader.IsDBNull(reader.GetOrdinal("admin_notes")) ? null : reader.GetString("admin_notes"),
                                    VerificationNotes = reader.IsDBNull(reader.GetOrdinal("verification_notes")) ? null : reader.GetString("verification_notes"),
                                    CreatedAt = reader.GetDateTime("created_at"),
                                    ReadStatus = reader.GetBoolean("read_status"),
                                    ReadAt = reader.IsDBNull(reader.GetOrdinal("read_at")) ? null : reader.GetDateTime("read_at")
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al obtener mensajes de rechazo: {ex.Message}");
            }
            return messages;
        }

        public (int statusCode, string message) MarkRejectionMessageAsRead(int messageId)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();

                    using (var cmd = new MySqlCommand("sp_mark_rejection_message_as_read", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        // Parámetros de entrada
                        cmd.Parameters.AddWithValue("p_message_id", messageId);

                        // Parámetros de salida
                        var statusCodeParam = new MySqlParameter("p_status_code", MySqlDbType.Int32)
                        { Direction = ParameterDirection.Output };
                        var messageParam = new MySqlParameter("p_message", MySqlDbType.VarChar, 255)
                        { Direction = ParameterDirection.Output };

                        cmd.Parameters.Add(statusCodeParam);
                        cmd.Parameters.Add(messageParam);

                        cmd.ExecuteNonQuery();

                        return (
                            Convert.ToInt32(statusCodeParam.Value),
                            messageParam.Value?.ToString() ?? "Mensaje marcado como leído exitosamente"
                        );
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al marcar mensaje como leído: {ex.Message}");
                return (-1, "Error al marcar el mensaje como leído");
            }
        }

        public int GetUnreadRejectionMessagesCount(string username)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();

                    var sql = "SELECT COUNT(*) FROM rejection_messages WHERE user_name = @username AND read_status = FALSE";

                    using (var cmd = new MySqlCommand(sql, con))
                    {
                        cmd.Parameters.AddWithValue("@username", username);
                        return Convert.ToInt32(cmd.ExecuteScalar());
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al obtener conteo de mensajes no leídos: {ex.Message}");
                return 0;
            }
        }
    }
}
