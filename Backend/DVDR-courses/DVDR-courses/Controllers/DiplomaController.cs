using DVDR_courses.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace DVDR_courses.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DiplomaController : Controller
    {
        IConfiguration _config;
        public DiplomaController(IConfiguration config)
        {
            _config = config;
        }

        [HttpPost("RequestDiplomaRegistration", Name = "PostRequesDiplomaRegistration")]
        public async Task<IActionResult> RequestDiplomaRegistration([FromForm] DiplomaRegistrationRequest request)
        {
            if (request == null || request.Documents == null)
            {
                return BadRequest(new { message = "La información proporcionada es inválida." });
            }

            // Generar carpeta aleatoria
            var folderName = Guid.NewGuid().ToString();
            request.FolderName = folderName;

            var baseFolderPath = Path.Combine("..", "..", "..", "Frontend", "public", "assets", "files", "diploma-documentation", folderName);

            try
            {
                Directory.CreateDirectory(baseFolderPath);

                foreach (var document in request.Documents)
                {
                    if (document.File != null)
                    {
                        var fileName = document.File.FileName;
                        var filePath = Path.Combine("assets", "files", "diploma-documentation", folderName, fileName);
                        var physicalPath = Path.Combine("..", "..", "..", "Frontend", "public", filePath);

                        using (var stream = new FileStream(physicalPath, FileMode.Create))
                        {
                            await document.File.CopyToAsync(stream);
                        }
                    }
                }

                var dbManager = new DBManager(_config);
                var (statusCode, message) = dbManager.RequestDiplomaRegistration(request);

                return statusCode == 1 ?
                    Ok(new { message }) :
                    StatusCode(500, new { message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al procesar la solicitud.", error = ex.Message });
            }
        }

        [HttpPost("RegisterDiploma", Name = "PostRegisterDiploma")]
        public IActionResult RegisterDiploma([FromBody] DiplomaApprovalDTO request)
        {
            if (request == null)
            {
                return BadRequest(new { message = "La información proporcionada es inválida." });
            }

            try
            {
                var dbManager = new DBManager(_config);
                var (statusCode, message) = dbManager.RegisterDiploma(request);

                return statusCode == 1 ?
                    Ok(new { message }) :
                    StatusCode(500, new { message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al registrar el diplomado.", error = ex.Message });
            }
        }

        [HttpPost("ApproveDiplomaRequest", Name = "PostApproveDiplomaRequest")]
        public IActionResult ApproveDiplomaRequest([FromBody] DiplomaApprovalRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { message = "La información proporcionada es inválida." });
            }

            try
            {
                var dbManager = new DBManager(_config);
                var (statusCode, message) = dbManager.ApproveDiplomaRequest(request);

                return statusCode == 1 ?
                    Ok(new { message }) :
                    StatusCode(500, new { message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al aprobar el diplomado.", error = ex.Message });
            }
        }

        [HttpGet("GetAllDiplomas")]
        public IActionResult GetAllDiplomas()
        {
            try
            {
                var dbManager = new DBManager(_config);
                var diplomas = dbManager.GetAllDiplomas();

                if (diplomas == null || !diplomas.Any())
                {
                    return NotFound(new { message = "No se encontraron diplomados registrados." });
                }

                return Ok(diplomas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los diplomados.", error = ex.Message });
            }
        }

        [HttpGet("GetDiplomasByCenter/{center}")]
        public IActionResult GetDiplomasByCenter(string center)
        {
            try
            {
                var dbManager = new DBManager(_config);
                var diplomas = dbManager.GetDiplomasByCenter(center);

                if (diplomas == null || !diplomas.Any())
                {
                    return Ok(new { message = $"No se encontraron diplomados para el centro {center}." });
                }

                return Ok(diplomas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los diplomados.", error = ex.Message });
            }
        }

        [HttpGet("GetCompletedDiplomas")]
        public IActionResult GetCompletedDiplomas([FromQuery] string username)
        {
            if (string.IsNullOrEmpty(username))
            {
                return BadRequest(new { message = "El username es requerido." });
            }

            try
            {
                var dbManager = new DBManager(_config);
                var diplomas = dbManager.GetCompletedDiplomas(username);

                if (diplomas == null || !diplomas.Any())
                {
                    return NotFound(new { message = "No se encontraron diplomados completados para este usuario." });
                }

                return Ok(diplomas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los diplomados.", error = ex.Message });
            }
        }

        [HttpPost("RequestDiplomaCertificates", Name = "PostRequestDiplomaCertificates")]
        public async Task<IActionResult> RequestDiplomaCertificates([FromForm] DiplomaCertificateRequestDTO request)
        {
            if (request == null || request.Documents == null || !request.Documents.Any())
            {
                return BadRequest(new { message = "La información proporcionada es inválida." });
            }

            // Generar carpeta aleatoria
            var folderName = Guid.NewGuid().ToString();
            request.FolderName = folderName;
            var basePath = Path.Combine("..", "..", "..", "Frontend", "public", "assets", "files", "request-diploma-certificates-documentation", folderName);

            try
            {
                // Crear directorio
                Directory.CreateDirectory(basePath);

                // Guardar los archivos
                foreach (var doc in request.Documents)
                {
                    if (doc.File != null)
                    {
                        var filePath = Path.Combine(basePath, doc.File.FileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await doc.File.CopyToAsync(stream);
                        }
                    }
                }

                // Procesar la solicitud en la base de datos
                var dbManager = new DBManager(_config);
                var (statusCode, message) = dbManager.RequestDiplomaCertificates(request);

                return statusCode == 1
                    ? Ok(new { message })
                    : StatusCode(500, new { message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al procesar la solicitud.", error = ex.Message });
            }
        }
    }
}
