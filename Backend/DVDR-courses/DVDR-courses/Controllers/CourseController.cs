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

            // Imprimir toda la información recibida
            try
            {
                Console.WriteLine("== Request Received ==");

                // Serializar y mostrar la información de CourseInfo
                Console.WriteLine("CourseInfo: " + JsonConvert.SerializeObject(request.CourseInfo, Formatting.Indented));

                // Serializar y mostrar los documentos
                var documentsInfo = request.Documents.Select(d => new
                {
                    d.File?.FileName,
                    d.File?.ContentType,
                    d.File?.Length
                });
                Console.WriteLine("Documents: " + JsonConvert.SerializeObject(documentsInfo, Formatting.Indented));

                // Serializar y mostrar el resto del request
                Console.WriteLine("Username: " + request.Username);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error al serializar el request: " + ex.Message);
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

            return statusCode switch
            {
                1 => Ok(new { message }),
                -2 => BadRequest(new { message }),
                _ => StatusCode(500, new { message }) // Error genérico
            };
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
    }
}

