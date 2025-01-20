using DVDR_courses.DTOs;
using DVDR_courses.Services;
using MySql.Data.MySqlClient;
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
    }
}
