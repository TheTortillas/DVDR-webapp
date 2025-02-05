using DVDR_courses.DTOs;
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

                    mySqlCommand.Parameters.Add(new MySqlParameter("p_username", p_username));
                    mySqlCommand.Parameters.Add(new MySqlParameter("p_password", p_password));

                    MySqlParameter isValidParam = new MySqlParameter("p_is_valid", MySqlDbType.Bit)
                    {
                        Direction = System.Data.ParameterDirection.Output
                    };
                    mySqlCommand.Parameters.Add(isValidParam);

                    MySqlParameter userCenterParam = new MySqlParameter("p_user_center", MySqlDbType.VarChar, 100)
                    {
                        Direction = System.Data.ParameterDirection.Output
                    };
                    mySqlCommand.Parameters.Add(userCenterParam);

                    con.Open();
                    mySqlCommand.ExecuteNonQuery();

                    bool isValid = Convert.ToBoolean(isValidParam.Value);
                    string userCenter = userCenterParam.Value?.ToString();

                    if (isValid)
                    {
                        var jwtService = new JwtService(_config);
                        string token = jwtService.GenerateToken(p_username);

                        return new { token, username = p_username, center = userCenter };
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

                    // Generar rutas de evidencia en el backend
                    var academicHistoriesJson = Newtonsoft.Json.JsonConvert.SerializeObject(request.AcademicHistories.Select(x => new
                    {
                        x.education_level,
                        x.period,
                        x.institution,
                        x.degree_awarded,
                        evidence_path = Path.Combine("assets", "files", "instructors-documentation", request.FolderName, "academic-history", x.Evidence.FileName)
                    }));

                    var workExperiencesJson = Newtonsoft.Json.JsonConvert.SerializeObject(request.WorkExperiences.Select(x => new
                    {
                        x.period,
                        x.organization,
                        x.position,
                        x.activity,
                        evidence_path = Path.Combine("assets", "files", "instructors-documentation", request.FolderName, "work-experience", x.Evidence.FileName)
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

                        string courseKey;
                        if (parentCourseId == null)
                        {
                            // **CASO: NUEVO CURSO**
                            var maxCourseNumberCmd = new MySqlCommand(@"
                                SELECT MAX(CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(course_key, '/', -2), '_', 1) AS UNSIGNED))
                                FROM courses
                                WHERE YEAR(created_at) = @currentYear", con);

                            maxCourseNumberCmd.Parameters.AddWithValue("@currentYear", currentDate.Year);

                            var maxCourseNumber = maxCourseNumberCmd.ExecuteScalar();
                            int nextCourseNumber = (maxCourseNumber == DBNull.Value) ? 1 : Convert.ToInt32(maxCourseNumber) + 1;

                            var courseCount = nextCourseNumber.ToString("D3");  // Convertir a formato 3 dígitos


                            // Generar course_key normal
                            var vigencia = $"{currentDate.Year}-{currentDate.Year + 2}";
                            courseKey = $"DVDR/{centerType}/{centerIdentifier}/{courseCount}/{vigencia}";
                        }
                        else
                        {
                            // **CASO: RENOVACIÓN**
                            var getParentCourseCmd = new MySqlCommand("SELECT course_key, renewal_count FROM courses WHERE id = @parentCourseId", con);
                            getParentCourseCmd.Parameters.AddWithValue("@parentCourseId", parentCourseId);
                            using (var parentReader = getParentCourseCmd.ExecuteReader())
                            {
                                if (!parentReader.Read())
                                {
                                    return (-3, "Curso a renovar no encontrado.");
                                }

                                var parentCourseKey = parentReader.GetString("course_key");
                                renewalCount = parentReader.GetInt32("renewal_count") + 1;
                            }

                            // Obtener el nuevo número de curso en el año
                            var countCoursesCmd = new MySqlCommand("SELECT COUNT(*) FROM courses WHERE YEAR(created_at) = @currentYear", con);
                            countCoursesCmd.Parameters.AddWithValue("@currentYear", currentDate.Year);
                            var courseCount = (Convert.ToInt32(countCoursesCmd.ExecuteScalar()) + 1).ToString("D3");

                            // Generar nueva course_key
                            var vigencia = $"{currentDate.Year}-{currentDate.Year + 2}";
                            courseKey = $"DVDR/{centerType}/{centerIdentifier}/{courseCount}_{renewalCount}/{vigencia}";
                        }

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
                        cmd.Parameters.AddWithValue("p_course_key", courseKey);
                        cmd.Parameters.AddWithValue("p_username", username);
                        cmd.Parameters.AddWithValue("p_expiration_date", expirationDate);
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
                        c.total_duration AS TotalDuration,
                        c.expiration_date AS ExpirationDate,
                        c.is_renewed AS IsRenewed
                    FROM courses c
                    INNER JOIN users u ON c.user_id = u.id
                    WHERE u.username = @username", con);

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
                        Clave = reader.GetString("Clave"),
                        Status = reader.GetString("Status"),
                        ApprovalStatus = reader.GetString("ApprovalStatus"),
                        TotalDuration = reader.GetInt32("TotalDuration"),
                        ExpirationDate = reader.GetDateTime("ExpirationDate"),
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
                                CourseKey = reader.GetString("course_key"),
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
                                ExpirationDate = reader.GetDateTime("expiration_date"),
                                RenewalCount = reader.GetInt32("renewal_count"),
                                ParentCourseId = reader.IsDBNull("parent_course_id") ? (int?)null : reader.GetInt32("parent_course_id"),
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
        public (int statusCode, string message) RegisterCourseSession(CourseSessionRequest request)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();

                    // 🔍 Obtener el course_id basado en la clave del curso
                    var courseCmd = new MySqlCommand("SELECT id FROM courses WHERE course_key = @course_key", con);
                    courseCmd.Parameters.AddWithValue("@course_key", request.CourseKey);
                    var courseId = Convert.ToInt32(courseCmd.ExecuteScalar());

                    if (courseId <= 0)
                    {
                        return (-1, "Error: No se encontró un curso con la clave proporcionada.");
                    }

                    // 🔄 Convertir el cronograma a JSON con formato correcto de 24 horas
                    var scheduleJson = JsonConvert.SerializeObject(
                        request.Schedule.Select(entry => new
                        {
                            date = DateTime.Parse(entry.Date).ToString("yyyy-MM-dd"),
                            start_time = DateTime.Parse(entry.Start).ToString("HH:mm:ss"),
                            end_time = DateTime.Parse(entry.End).ToString("HH:mm:ss")
                        })
                    );

                    // 🔥 Llamada al procedimiento almacenado sin `status`
                    var cmd = new MySqlCommand("CALL sp_register_course_session(@course_id, @period, @num_participants, @num_certificates, @schedule_json, @status_code, @message)", con);
                    cmd.Parameters.AddWithValue("@course_id", courseId);
                    cmd.Parameters.AddWithValue("@period", request.Period);
                    cmd.Parameters.AddWithValue("@num_participants", request.NumberOfParticipants);
                    cmd.Parameters.AddWithValue("@num_certificates", request.NumberOfCertificates);
                    cmd.Parameters.AddWithValue("@schedule_json", scheduleJson);

                    var statusCodeParam = new MySqlParameter("@status_code", MySqlDbType.Int32) { Direction = ParameterDirection.Output };
                    var messageParam = new MySqlParameter("@message", MySqlDbType.VarChar, 255) { Direction = ParameterDirection.Output };
                    cmd.Parameters.Add(statusCodeParam);
                    cmd.Parameters.Add(messageParam);

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

                        if (!courseMap.ContainsKey(title))
                        {
                            courseMap[title] = new CourseWithSessionsResponse
                            {
                                Title = title,
                                CourseKeys = new List<string> { reader.GetString("clave") },
                                Sessions = new List<SessionResponse>()
                            };
                        }
                        else
                        {
                            courseMap[title].CourseKeys.Add(reader.GetString("clave"));
                        }
                    }

                    // Leer las sesiones
                    if (reader.NextResult())
                    {
                        while (reader.Read())
                        {
                            string courseKey = reader.GetString("clave"); // Ahora usamos la clave correcta
                            foreach (var course in courseMap.Values)
                            {
                                if (course.CourseKeys.Contains(courseKey))
                                {
                                    course.Sessions.Add(new SessionResponse
                                    {
                                        Id = reader.GetInt32("session_id"),  // Asignamos el ID de la sesión
                                        Clave = courseKey, // Ahora se almacena correctamente
                                        Periodo = reader.GetString("periodo"),
                                        Participantes = reader.GetInt32("participantes"),
                                        Constancias = reader.GetInt32("constancias"),
                                        Estatus = reader.GetString("estatus")
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

        public (int statusCode, string message) RequestCertificates(int sessionId, List<CertificateDocumentDTO> documents)
        {
            try
            {
                using (var con = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    con.Open();

                    // Create session folder
                    var sessionFolder = Guid.NewGuid().ToString();
                    var basePath = Path.Combine("assets", "files", "request-certificates-documentation", sessionFolder);
                    var physicalPath = Path.Combine("..", "..", "..", "Frontend", "public", basePath);
                    Directory.CreateDirectory(physicalPath);

                    // Save files and prepare JSON data
                    var documentsList = new List<object>();
                    foreach (var doc in documents)
                    {
                        if (doc.File != null)
                        {
                            var fileName = doc.File.FileName;
                            var filePath = Path.Combine(basePath, fileName);
                            var fullPath = Path.Combine(physicalPath, fileName);

                            using (var stream = new FileStream(fullPath, FileMode.Create))
                            {
                                doc.File.CopyTo(stream);
                            }

                            documentsList.Add(new
                            {
                                document_id = doc.DocumentId,
                                filePath = filePath
                            });
                        }
                    }

                    // Convert to JSON
                    var jsonDocs = JsonConvert.SerializeObject(documentsList);

                    // Call stored procedure
                    using (var cmd = new MySqlCommand("sp_request_certificates", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        // Input parameters
                        cmd.Parameters.AddWithValue("p_session_id", sessionId);
                        cmd.Parameters.AddWithValue("p_documentation", jsonDocs);

                        // Output parameters
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

                        cmd.ExecuteNonQuery();

                        // Get results
                        var status = (int)statusParam.Value;
                        var message = messageParam.Value.ToString();

                        return (status, message);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return (-1, "Error al procesar la solicitud de constancias");
            }
        }
    }
}
