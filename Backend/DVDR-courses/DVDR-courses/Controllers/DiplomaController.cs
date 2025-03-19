using DVDR_courses.DTOs;
using DVDR_courses.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace DVDR_courses.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DiplomaController : Controller
    {
        private readonly IConfiguration _config;
        private readonly FileStorageHelper _fileStorage;
        private readonly DBManager _dbManager;


        public DiplomaController(IConfiguration config, IWebHostEnvironment env)
        {
            _config = config;
            _fileStorage = new FileStorageHelper(config, env);
            _dbManager = new DBManager(_config);

        }

        [HttpPost("RequestDiplomaRegistration")]
        public async Task<IActionResult> RequestDiplomaRegistration([FromForm] DiplomaRegistrationRequest request)
        {
            if (request?.Documents == null) return BadRequest(new { message = "La información proporcionada es inválida." });

            var folderName = Guid.NewGuid().ToString();
            request.FolderName = folderName;

            try
            {
                foreach (var document in request.Documents)
                {
                    if (document.File != null)
                    {
                        var fileName = document.File.FileName;
                        var storagePath = _fileStorage.GetStoragePath("DiplomaDocumentation", folderName);
                        var fullPath = Path.Combine(storagePath, fileName);

                        await _fileStorage.SaveFileAsync(document.File, fullPath);
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
        public async Task<IActionResult> ApproveDiplomaRequest([FromBody] DiplomaApprovalRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { message = "La información proporcionada es inválida." });
            }

            try
            {
                (int statusCode, string message) result;

                if (request.ApprovalStatus == "rejected")
                {
                    // 1️ Obtener la carpeta del diplomado desde la BD
                    var folderName = await _dbManager.GetDiplomaFolder(request.DiplomaId);

                    // 2️ Si existe, eliminar archivos y la carpeta correspondiente
                    if (!string.IsNullOrEmpty(folderName))
                    {
                        var folderPath = _fileStorage.GetStoragePath("DiplomaDocumentation", folderName);
                        if (Directory.Exists(folderPath))
                        {
                            try
                            {
                                Directory.Delete(folderPath, true);
                                Console.WriteLine($"Carpeta eliminada: {folderPath}");
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"No se pudo borrar la carpeta: {ex.Message}");
                            }
                        }
                    }

                    // 3️ Eliminar el diplomado en la BD
                    result = await _dbManager.DeleteDiploma(request.DiplomaId);
                }
                else
                {
                    // Si no es rechazo, aprobar el diplomado
                    result = await _dbManager.ApproveDiplomaRequest(request);
                }

                //  Comprobación de estado para evitar que se interprete como error
                return result.statusCode == 1
                    ? Ok(new { message = result.message }) // Se devuelve correctamente un 200 si el status es 1
                    : StatusCode(500, new { message = result.message }); //  Si no es 1, se mantiene el error
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al aprobar el diplomado.", error = ex.Message });
            }
        }



        [HttpPost("UpdateDiplomaVerificationStatus")]
        public async Task<IActionResult> UpdateDiplomaVerificationStatus([FromBody] DiplomaVerificationRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { message = "La información proporcionada es inválida." });
            }

            try
            {
                (int statusCode, string message) result;

                if (request.VerificationStatus.Equals("rejected", StringComparison.OrdinalIgnoreCase))
                {
                    // 1️⃣ Obtener la carpeta del diplomado desde la BD
                    var folderName = await _dbManager.GetDiplomaFolder(request.DiplomaId);

                    // 2️⃣ Si existe, eliminar archivos y la carpeta correspondiente
                    if (!string.IsNullOrEmpty(folderName))
                    {
                        var folderPath = _fileStorage.GetStoragePath("DiplomaDocumentation", folderName);
                        if (Directory.Exists(folderPath))
                        {
                            try
                            {
                                Directory.Delete(folderPath, true);
                                Console.WriteLine($"Carpeta eliminada: {folderPath}");
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"No se pudo borrar la carpeta: {ex.Message}");
                            }
                        }
                    }

                    // 3️ Eliminar el diplomado en la BD
                    result = await _dbManager.DeleteDiploma(request.DiplomaId);
                }
                else if (request.VerificationStatus.Equals("approved", StringComparison.OrdinalIgnoreCase))
                {
                    //  Aprobar el estado de verificación en la BD
                    result = await _dbManager.UpdateDiplomaVerificationStatus(
                        request.DiplomaId,
                        request.VerificationStatus,
                        request.VerificationNotes
                    );
                }
                else
                {
                    return BadRequest(new { message = "Estado de verificación no válido." });
                }

                //  Verifica el statusCode antes de responder
                return result.statusCode == 1
                    ? Ok(new { message = result.message }) // Si el statusCode es 1, respuesta 200
                    : StatusCode(500, new { message = result.message }); //  Si no, error 500
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar el estado de verificación del diplomado.", error = ex.Message });
            }
        }

        [HttpGet("GetAllDiplomas")]
        public IActionResult GetAllDiplomas()
        {
            try
            {
                var dbManager = new DBManager(_config);
                var diplomas = dbManager.GetAllDiplomas();

                // Devolver un array vacío y código 200 en lugar de 404 cuando no hay diplomados
                if (diplomas == null)
                {
                    return Ok(new { message = "No se encontraron diplomados registrados.", data = new List<object>() });
                }

                return Ok(diplomas.Any() ? diplomas : new { message = "No se encontraron diplomados registrados.", data = new List<object>() });
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
                    return Ok(new
                    {
                        message = "No se encontraron diplomados completados para este usuario.",
                        data = new List<object>()
                    });
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

            try
            {
                // Guardar los archivos usando FileStorageHelper
                foreach (var doc in request.Documents)
                {
                    if (doc.File != null)
                    {
                        var storagePath = _fileStorage.GetStoragePath("DiplomaCertificates", folderName);
                        var fullPath = Path.Combine(storagePath, doc.File.FileName);

                        await _fileStorage.SaveFileAsync(doc.File, fullPath);
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

        [HttpPost("UploadDiplomaDocument", Name = "PostUploadDiplomaDocument")]
        public async Task<IActionResult> UploadDiplomaDocument([FromForm] SingleDiplomaDocumentRequest request)
        {
            if (request == null || request.File == null)
            {
                return BadRequest(new { message = "La información proporcionada es inválida." });
            }

            try
            {
                // Usar el folderName proporcionado en la solicitud
                var folderName = request.FolderName;
                var fileName = request.File.FileName;

                // Usar FileStorageHelper para obtener y construir las rutas
                var storagePath = _fileStorage.GetStoragePath("DiplomaDocumentation", folderName);
                var fullPath = Path.Combine(storagePath, fileName);

                // Guardar el archivo
                await _fileStorage.SaveFileAsync(request.File, fullPath);

                // Obtener la ruta relativa para guardar en la base de datos
                var relativePath = _fileStorage.GetRelativePath("DiplomaDocumentation", folderName, fileName);

                // Llamar a DBManager para invocar el SP
                var dbManager = new DBManager(_config);
                var (statusCode, message) = dbManager.UploadDiplomaDocument(
                    request.DiplomaId,
                    request.DocumentId,
                    relativePath);

                return statusCode == 1
                    ? Ok(new { message })
                    : StatusCode(500, new { message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al subir el documento.", error = ex.Message });
            }
        }

        [HttpGet("GetRequestedDiplomaCertificates")]
        public IActionResult GetRequestedDiplomaCertificates()
        {
            var db = new DBManager(_config);
            var requests = db.GetRequestedDiplomaCertificates(); // método que listará las solicitudes
            return Ok(requests);
        }

        [HttpPost("UploadDiplomaOfficialLetter")]
        public async Task<IActionResult> UploadDiplomaOfficialLetter([FromForm] UploadDiplomaOfficialLetterDTO request)
        {
            if (request.File == null || request.File.Length == 0)
                return BadRequest(new { message = "Archivo inválido." });

            if (request.NumberOfCertificates <= 0)
                return BadRequest(new { message = "El número de certificados debe ser mayor a 0." });

            try
            {
                // 1️ Obtener la carpeta base desde FileStorageHelper
                string folderName = Guid.NewGuid().ToString();
                string storagePath = _fileStorage.GetStoragePath("DiplomaOfficialLetters", folderName);
                Directory.CreateDirectory(storagePath);

                // 2️ Guardar el archivo en la carpeta
                string filePath = Path.Combine(storagePath, request.File.FileName);
                await _fileStorage.SaveFileAsync(request.File, filePath);

                // 3️ Obtener la ruta relativa para la BD
                string relativePath = _fileStorage.GetRelativePath("DiplomaOfficialLetters", folderName, request.File.FileName);

                // 4️ Guardar en la base de datos
                var result = await _dbManager.UploadDiplomaOfficialLetter(request.DiplomaId, relativePath, request.NumberOfCertificates);

                //  Devolver respuesta basada en el status code
                return result.statusCode == 1
                    ? Ok(new { message = result.message })  // Respuesta 200 si se guarda correctamente
                    : StatusCode(500, new { message = result.message }); // Error si el status code no es 1
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al subir el oficio del diplomado.", error = ex.Message });
            }
        }


        [HttpGet("GetCertificateOfficialLetter/{diplomaId}")]
        public IActionResult GetCertificateOfficialLetter(int diplomaId)
        {
            try
            {
                var dbManager = new DBManager(_config);
                var result = dbManager.GetDiplomaCertificateOfficialLetter(diplomaId);

                if (result == null)
                {
                    return NotFound(new { message = "No se encontró el oficio de certificados para este diplomado." });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener el oficio.", error = ex.Message });
            }
        }
    }
}
