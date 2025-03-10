using DVDR_courses.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using System.Data;

namespace DVDR_courses.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InstructorController : ControllerBase
    {
        IConfiguration _config;
        DBManager _dbManager;

        public InstructorController(IConfiguration conf)
        {
            _config = conf;
            _dbManager = new DBManager(_config);

        }

        [HttpPost("RegisterInstructor", Name = "PostRegisterInstructor")]
        public async Task<IActionResult> RegisterInstructor([FromForm] InstructorRegister request)
        {
            if (request == null || request.GeneralInfo == null)
            {
                return BadRequest(new { message = "La información proporcionada es inválida." });
            }

            // Generar carpeta aleatoria
            var folderName = Guid.NewGuid().ToString(); // Nombre aleatorio único
            request.FolderName = folderName;

            // Ruta base: assets/instructors-documentation/{folderName}
            var baseFolderPath = Path.Combine("..", "..", "..", "Frontend", "public", "assets", "files", "instructors-documentation", folderName);
            var academicFolderPath = Path.Combine(baseFolderPath, "academic-history");
            var workExpFolderPath = Path.Combine(baseFolderPath, "work-experience");

            try
            {
                // Crear directorios si no existen
                Directory.CreateDirectory(academicFolderPath);
                Directory.CreateDirectory(workExpFolderPath);

                // Guardar archivos académicos
                foreach (var academic in request.AcademicHistories)
                {
                    if (academic.Evidence != null)
                    {
                        var filePath = Path.Combine(academicFolderPath, academic.Evidence.FileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await academic.Evidence.CopyToAsync(stream);
                        }
                        // No se necesita asignar EvidencePath aquí
                    }
                }

                // Guardar archivos laborales
                foreach (var workExp in request.WorkExperiences)
                {
                    if (workExp.Evidence != null)
                    {
                        var filePath = Path.Combine(workExpFolderPath, workExp.Evidence.FileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await workExp.Evidence.CopyToAsync(stream);
                        }
                        // No se necesita asignar EvidencePath aquí
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al guardar los archivos.", error = ex.Message });
            }

            // Llamar al SP para guardar los datos en la BD
            var dbManager = new DBManager(_config);
            var (statusCode, message) = dbManager.RegisterInstructorAll(request);

            return statusCode switch
            {
                1 => Ok(new { message }),
                -2 => BadRequest(new { message }),
                _ => StatusCode(500, new { message }) // Error genérico
            };
        }
        [HttpGet("GetInstructors", Name = "GetInstructors")]
        public IActionResult GetInstructors()
        {
            try
            {
                using (var connection = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    var query = @"
                        SELECT 
                            agi.id, 
                            CONCAT(agi.first_name, ' ', agi.last_name, ' ', agi.second_last_name) AS nombre, 
                            agi.knowledge_area,
                            c.name AS centro
                        FROM 
                            actors_general_information agi
                            JOIN centers c
                                ON c.type = agi.center_type
                                AND c.identifier = agi.center_identifier;
                    ";

                    var instructors = new List<object>();
                    using (var command = new MySqlCommand(query, connection))
                    {
                        connection.Open();
                        using (var reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                var rawArea = reader.GetString("knowledge_area");
                                List<string> areas = new List<string>();

                                // Intenta parsear como JSON, si falla, úsalo como CSV
                                try
                                {
                                    areas = JsonConvert.DeserializeObject<List<string>>(rawArea);
                                }
                                catch
                                {
                                    areas = rawArea
                                        .Split(',')
                                        .Select(a => a.Trim())
                                        .Where(a => !string.IsNullOrEmpty(a))
                                        .ToList();
                                }

                                instructors.Add(new
                                {
                                    Id = reader.GetInt32("id"),
                                    Nombre = reader.GetString("nombre"),
                                    Centro = reader.GetString("centro"),
                                    AreasExpertise = areas
                                });
                            }
                        }
                    }

                    return Ok(instructors);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los instructores.", error = ex.Message });
            }
        }

        [HttpGet("GetExpertiseAreas", Name = "GetExpertiseAreas")]
        public IActionResult GetExpertiseAreas()
        {
            try
            {
                using (var connection = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    var query = "SELECT name FROM academic_categories;";

                    var areas = new List<string>();
                    using (var command = new MySqlCommand(query, connection))
                    {
                        connection.Open();
                        using (var reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                areas.Add(reader.GetString("name"));
                            }
                        }
                    }

                    return Ok(areas.Distinct().OrderBy(area => area));
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener las áreas de expertise.", error = ex.Message });
            }
        }

        [HttpGet("GetCenters", Name = "GetCenters")]
        public IActionResult GetCenters()
        {
            try
            {
                using (var connection = new MySqlConnection(_config.GetConnectionString("default")))
                {
                    var query = @"SELECT name FROM centers;";
                    var centers = new List<string>();

                    using (var command = new MySqlCommand(query, connection))
                    {
                        connection.Open();
                        using (var reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                centers.Add(reader.GetString("name"));
                            }
                        }
                    }

                    return Ok(centers.Distinct().OrderBy(c => c));
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los centros.", error = ex.Message });
            }
        }
        [HttpGet("GetAllInstructors")]
        public IActionResult GetAllInstructors()
        {
            var instructors = _dbManager.GetAllInstructors();
            return Ok(instructors);
        }
    }
}

