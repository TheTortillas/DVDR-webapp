using DVDR_courses.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using static Org.BouncyCastle.Math.EC.ECCurve;

namespace DVDR_courses.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CourseController : ControllerBase
    {
        IConfiguration _config;
        public CourseController(IConfiguration config)
        {
            _config = config;
        }

        [HttpPost("RegisterCourse", Name = "PostRegisterCourse")]
        public async Task<IActionResult> RegisterCourse([FromForm] CourseRegister request)
        {
            if (request == null || request.CourseInfo == null || request.Documents == null)
            {
                return BadRequest(new { message = "La información proporcionada es inválida." });
            }

            // Validar que el username esté presente
            if (string.IsNullOrEmpty(request.Username))
            {
                return BadRequest(new { message = "El username es requerido." });
            }

            // Generar carpeta aleatoria
            var folderName = Guid.NewGuid().ToString(); // Nombre único para la carpeta
            request.FolderName = folderName;

            // Ruta base para almacenar archivos
            var baseFolderPath = Path.Combine("..", "..", "..", "Frontend", "public", "assets", "files", "courses-documentation", folderName);

            try
            {
                // Crear directorio si no existe
                Directory.CreateDirectory(baseFolderPath);

                foreach (var document in request.Documents)
                {
                    if (document.File != null)
                    {
                        var fileName = document.File.FileName;
                        var filePath = Path.Combine("assets", "files", "courses-documentation", folderName, fileName);

                        // Physical save path
                        var physicalPath = Path.Combine("..", "..", "..", "Frontend", "public", filePath);
                        var directory = Path.GetDirectoryName(physicalPath);
                        Directory.CreateDirectory(directory);

                        using (var stream = new FileStream(physicalPath, FileMode.Create))
                        {
                            await document.File.CopyToAsync(stream);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al guardar los documentos.", error = ex.Message });
            }

            // Llamar al SP para guardar los datos en la BD
            var dbManager = new DBManager(_config);
            var (statusCode, message) = dbManager.RegisterCourseAll(request, request.Username);

            return statusCode == 1 ? Ok(new { message }) : StatusCode(500, new { message });
        }

        [HttpGet("GetCoursesByUser")]
        public IActionResult GetCoursesByUser([FromQuery] string username)
        {
            if (string.IsNullOrEmpty(username))
            {
                return BadRequest(new { message = "El username es requerido." });
            }

            try
            {
                var dbManager = new DBManager(_config);
                var courses = dbManager.GetCoursesByUser(username);
                return Ok(courses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los cursos.", error = ex.Message });
            }
        }

        [HttpGet("GetCourse/{id}")]
        public IActionResult GetCourseById(int id)
        {
            var dbManager = new DBManager(_config);
            var course = dbManager.GetCourseById(id);

            if (course == null)
                return NotFound(new { message = "Curso no encontrado" });

            return Ok(course);
        }
      
        [HttpPost("RegisterCourseSession", Name = "PostRegisterCourseSession")]
        public IActionResult RegisterCourseSession([FromBody] CourseSessionRequest request)
        {
            var dbManager = new DBManager(_config);
            var result = dbManager.RegisterCourseSession(request);

            if (result.statusCode == 1)
            {
                return Ok(new { message = "Sesión del curso registrada exitosamente" });
            }
            return BadRequest(new { message = result.message });
        }

        [HttpGet("UserCoursesWithSessions", Name = "GetUserCoursesWithSessions")]
        public IActionResult GetUserCoursesWithSessions([FromQuery] string username)
        {
   
            var dbManager = new DBManager(_config);
            var courses = dbManager.GetCoursesWithSessions(username);

            if (courses == null || !courses.Any())
                return NotFound(new { message = "No se encontraron cursos registrados para este usuario." });

            return Ok(courses);
        }
    }
}

