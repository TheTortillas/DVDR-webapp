using DVDR_courses.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System.Data;

namespace DVDR_courses.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InstructorController : ControllerBase
    {
        IConfiguration _config;

        public InstructorController(IConfiguration conf)
        {
            _config = conf;
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
    }
}

