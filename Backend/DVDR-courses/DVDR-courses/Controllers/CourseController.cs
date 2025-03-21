using DVDR_courses.DTOs;
using DVDR_courses.DTOs.CoursesApproval;
using DVDR_courses.Helpers;
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
        private readonly IConfiguration _config;
        private readonly FileStorageHelper _fileStorage;
        private readonly DBManager _dbManager;

        public CourseController(IConfiguration config, IWebHostEnvironment env)
        {
            _config = config;
            _fileStorage = new FileStorageHelper(config, env);
            _dbManager = new DBManager(_config);
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
            var folderName = Guid.NewGuid().ToString();
            request.FolderName = folderName;

            try
            {
                // Guardar los documentos usando FileStorageHelper
                foreach (var document in request.Documents)
                {
                    if (document.File != null)
                    {
                        var storagePath = _fileStorage.GetStoragePath("CoursesDocumentation", folderName);
                        var fullPath = Path.Combine(storagePath, document.File.FileName);

                        await _fileStorage.SaveFileAsync(document.File, fullPath);
                    }
                }

                // Llamar al SP para guardar los datos en la BD
                var (statusCode, message) = _dbManager.RegisterCourseAll(request, request.Username);

                return statusCode == 1 ?
                    Ok(new { message }) :
                    StatusCode(500, new { message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al guardar los documentos.", error = ex.Message });
            }
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

        [HttpGet("GetAllCourses")]
        public IActionResult GetAllCourses()
        {
            try
            {
                var dbManager = new DBManager(_config);
                var courses = dbManager.GetAllCourses();

                // Devolver un array vacío y código 200 en lugar de 404 cuando no hay cursos
                if (courses == null)
                {
                    return Ok(new { message = "No se encontraron cursos", data = new List<object>() });
                }

                return Ok(courses.Any() ? courses : new { message = "No se encontraron cursos", data = new List<object>() });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los cursos.", error = ex.Message });
            }
        }

        [HttpPost("RegisterCourseSession", Name = "PostRegisterCourseSession")]
        public IActionResult RegisterCourseSession([FromBody] CourseSessionRequest request)
        {
            try
            {
                // Generar un nombre de carpeta único
                string folder = Guid.NewGuid().ToString();

                // Crear el directorio para sesiones de curso
                var storagePath = _fileStorage.GetStoragePath("SignedRequestLetters", folder);
                Directory.CreateDirectory(storagePath);

                // Pasar el nombre de la carpeta a la solicitud (si es necesario)
                request.FolderName = folder;

                // Llamar al DBManager con la información de la carpeta
                var result = _dbManager.RegisterCourseSession(request);

                if (result.statusCode == 1)
                {
                    return Ok(new { message = "Sesión del curso registrada exitosamente" });
                }
                return BadRequest(new { message = result.message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al registrar la sesión del curso.", error = ex.Message });
            }
        }

        [HttpPost("ApproveOrRejectSession")]
        public async Task<IActionResult> ApproveOrRejectSession([FromForm] SessionApprovalRequest request)
        {
            if (request == null)
                return BadRequest(new { message = "Datos inválidos" });

            try
            {
                if (request.ApprovalStatus == "approved")
                {
                    // 1️ Verificar si la sesión tiene un documento firmado en la BD
                    var signedDocPath = await _dbManager.GetSignedRequestLetterPath(request.SessionId);

                    if (string.IsNullOrEmpty(signedDocPath))
                        return BadRequest(new { message = "No se puede aprobar una sesión sin documento firmado" });

                    // 2️ Aprobar la sesión
                    var result = await _dbManager.ApproveSession(request.SessionId);
                    return StatusCode(result.statusCode, new { message = result.message });
                }
                else // Rechazar sesión
                {
                    // 1️ Obtener los datos de la sesión antes de eliminarla
                    var sessionData = await _dbManager.GetSessionData(request.SessionId);

                    // 2️ Eliminar el documento firmado si existe
                    if (!string.IsNullOrEmpty(sessionData.DocumentPath))
                    {
                        var physicalPath = _fileStorage.GetStoragePath("SignedRequestLetters", sessionData.FolderName);
                        var filePath = Path.Combine(physicalPath, Path.GetFileName(sessionData.DocumentPath));

                        if (System.IO.File.Exists(filePath))
                        {
                            try
                            {
                                System.IO.File.Delete(filePath);
                                Console.WriteLine($"Archivo eliminado: {filePath}");
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"No se pudo borrar el archivo: {ex.Message}");
                            }
                        }
                    }

                    // 3️ Verificar si la carpeta se debe eliminar
                    bool canDeleteFolder = await _dbManager.CanDeleteFolder(sessionData.FolderName, request.SessionId);
                    if (canDeleteFolder && !string.IsNullOrEmpty(sessionData.FolderName))
                    {
                        var folderPath = _fileStorage.GetStoragePath("SignedRequestLetters", sessionData.FolderName);
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

                    // 4️ Rechazar la sesión en la BD
                    var result = await _dbManager.RejectSession(request.SessionId);
                    return StatusCode(result.statusCode, new { message = result.message });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }


        [HttpGet("GetSessionOfficialLetter/{sessionId}")]
        public IActionResult GetSessionOfficialLetter(int sessionId)
        {
            var dbManager = new DBManager(_config);
            var result = dbManager.GetSessionOfficialLetter(sessionId);

            if (result == null)
                return NotFound(new { message = "No se encontró el oficio de la sesión" });

            return Ok(result);
        }

        [HttpGet("GetPendingApertures")]
        public IActionResult GetPendingApertures()
        {
            try
            {
                var dbManager = new DBManager(_config);
                var pendingApertures = dbManager.GetPendingApertures();

                if (pendingApertures == null)
                    return StatusCode(500, new { message = "Error al obtener las aperturas pendientes" });

                if (!pendingApertures.Any())
                    return Ok(new { message = "No hay aperturas pendientes", data = pendingApertures });

                return Ok(pendingApertures);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("GetUserPendingApertures")]
        public IActionResult GetUserPendingApertures([FromQuery] string username)
        {
            if (string.IsNullOrEmpty(username))
            {
                return BadRequest(new { message = "El nombre de usuario es requerido." });
            }

            try
            {
                var dbManager = new DBManager(_config);
                var pendingApertures = dbManager.GetUserPendingApertures(username);

                if (pendingApertures == null)
                    return StatusCode(500, new { message = "Error al obtener las aperturas pendientes del centro" });

                if (!pendingApertures.Any())
                    return Ok(new { message = "No hay aperturas pendientes para este centro", data = pendingApertures });

                return Ok(pendingApertures);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }
        [HttpPost("UploadSignedRequestLetter")]
        public async Task<IActionResult> UploadSignedRequestLetter([FromForm] UploadSignedRequestLetterDTO request)
        {
            if (request.File == null || request.File.Length == 0)
                return BadRequest(new { message = "El archivo PDF es requerido" });

            try
            {
                // 1. Obtener carpeta asignada a la sesión
                var folderName = await _dbManager.GetCourseSessionFolder(request.SessionId);
                if (string.IsNullOrEmpty(folderName))
                {
                    // Si la sesión aún no tiene carpeta, creamos y asignamos una
                    folderName = Guid.NewGuid().ToString();
                    await _dbManager.AssignFolderToSession(request.SessionId, folderName);
                }

                // 2. Obtener la ruta física donde se guardará
                var storagePath = _fileStorage.GetStoragePath("SignedRequestLetters", folderName);
                Directory.CreateDirectory(storagePath);

                // 3. Guardar el archivo físicamente
                var physicalPath = Path.Combine(storagePath, request.File.FileName);
                await _fileStorage.SaveFileAsync(request.File, physicalPath);

                // 4. Construir la ruta relativa que se grabará en la BD
                //    Por ejemplo: "assets\files\signed-request-letters\{folder}\MiArchivo.pdf"
                var relativePath = Path.Combine(
                    "assets",
                    _config["FileStorage:Folders:SignedRequestLetters"], // "files/signed-request-letters"
                    folderName,
                    request.File.FileName
                );

                // 5. Llamar a UploadSignedRequestLetter para actualizar la BD
                var result = await _dbManager.UploadSignedRequestLetter(
                    request.SessionId,
                    relativePath,
                    folderName
                );

                return result.statusCode == 200
                    ? Ok(new { message = result.message })
                    : StatusCode(result.statusCode, new { message = result.message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al procesar la solicitud", error = ex.Message });
            }
        }
        [HttpGet("UserCoursesWithSessions", Name = "GetUserCoursesWithSessions")]
        public IActionResult GetUserCoursesWithSessions([FromQuery] string username)
        {
            try
            {
                var dbManager = new DBManager(_config);
                var courses = dbManager.GetCoursesWithSessions(username);

                if (courses == null || !courses.Any())
                {
                    return Ok(new
                    {
                        message = "No se encontraron cursos registrados para este usuario.",
                        data = new List<object>()
                    });
                }

                return Ok(courses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los cursos.", error = ex.Message });
            }
        }

        [HttpPost("RequestCertificates", Name = "PostRequestCertificates")]
        public async Task<IActionResult> RequestCertificates([FromForm] CertificateRequestDTO request)
        {
            if (request == null || request.Documents == null || !request.Documents.Any())
            {
                return BadRequest(new { message = "La información proporcionada es inválida." });
            }

            try
            {
                // 1. Generar la carpeta de sesión
                var sessionFolder = Guid.NewGuid().ToString();

                // 2. Obtener la ruta de almacenamiento y asegurarnos de que exista
                var storagePath = _fileStorage.GetStoragePath("RequestCertificatesDocumentation", sessionFolder);
                Directory.CreateDirectory(storagePath);

                // 3. Guardar los archivos y construir la lista de documentos
                var documentsList = new List<object>();
                foreach (var doc in request.Documents)
                {
                    if (doc.File != null)
                    {
                        var filePath = Path.Combine(storagePath, doc.File.FileName);
                        await _fileStorage.SaveFileAsync(doc.File, filePath);

                        // Ruta relativa para la base de datos
                        var relativePath = Path.Combine(
                            "assets",
                            _config["FileStorage:Folders:RequestCertificatesDocumentation"],
                            sessionFolder,
                            doc.File.FileName
                        );

                        documentsList.Add(new
                        {
                            document_id = doc.DocumentId,
                            filePath = relativePath
                        });
                    }
                }

                // 4. Llamar a DBManager para registrar la información en la base de datos
                var (statusCode, message) = await _dbManager.RequestCertificates(request.SessionId, documentsList, sessionFolder);

                return statusCode == 1
                    ? Ok(new { message })
                    : StatusCode(500, new { message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al procesar la solicitud.", error = ex.Message });
            }
        }


        [HttpGet("GetCourseSessions/{courseId}")]
        public IActionResult GetCourseSessions(int courseId)
        {
            try
            {
                var dbManager = new DBManager(_config);
                var sessions = dbManager.GetCourseSessions(courseId);

                if (sessions == null)
                    return StatusCode(500, new { message = "Error al obtener las sesiones del curso" });

                if (!sessions.Any())
                    return NotFound(new { message = "No se encontraron sesiones para este curso" });

                return Ok(sessions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpPatch("ApproveOrRejectCourse")]
        public async Task<IActionResult> ApproveOrRejectCourse([FromBody] ApproveRejectDTO request)
        {
            if (request == null || request.CourseId <= 0 || string.IsNullOrEmpty(request.ApprovalStatus))
                return BadRequest(new { message = "Datos inválidos en la solicitud." });

            // Si es rechazo, obtener la carpeta primero, antes de borrar en la BD
            string folderName = null;
            if (request.ApprovalStatus.Equals("rejected", StringComparison.OrdinalIgnoreCase))
            {
                folderName = await _dbManager.GetCourseFolder(request.CourseId);
            }

            // Llamamos al método de actualización/rechazo de la base de datos
            var (statusCode, message) = _dbManager.UpdateCourseApprovalStatus(
                request.CourseId,
                request.ApprovalStatus,
                request.AdminNotes
            );

            // Solo si la operación de BD fue exitosa y era un rechazo, borramos los archivos
            if (statusCode == 1 &&
                request.ApprovalStatus.Equals("rejected", StringComparison.OrdinalIgnoreCase) &&
                !string.IsNullOrEmpty(folderName))
            {
                var folderPath = _fileStorage.GetStoragePath("CoursesDocumentation", folderName);
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
                        // Consideramos una advertencia, no un error crítico
                    }
                }
            }

            if (statusCode == 1)
                return Ok(new { message });
            else
                return StatusCode(500, new { message });
        }

        [HttpPatch("VerifyOrRejectCourse")]
        public async Task<IActionResult> VerifyOrRejectCourse([FromBody] VerifyRejectDTO request)
        {
            if (request == null || request.CourseId <= 0 || string.IsNullOrEmpty(request.VerificationStatus))
                return BadRequest(new { message = "Datos inválidos en la solicitud." });

            // Si es rechazo, obtener la carpeta primero, antes de borrar en la BD
            string folderName = null;
            if (request.VerificationStatus.Equals("rejected", StringComparison.OrdinalIgnoreCase))
            {
                folderName = await _dbManager.GetCourseFolder(request.CourseId);
            }

            // Llamamos al método de actualización/rechazo de la base de datos
            var (statusCode, message) = _dbManager.UpdateCourseVerificationStatus(
                request.CourseId,
                request.VerificationStatus,
                request.VerificationNotes
            );

            // Solo si la operación de BD fue exitosa y era un rechazo, borramos los archivos
            if (statusCode == 1 &&
                request.VerificationStatus.Equals("rejected", StringComparison.OrdinalIgnoreCase) &&
                !string.IsNullOrEmpty(folderName))
            {
                var folderPath = _fileStorage.GetStoragePath("CoursesDocumentation", folderName);
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
                        // Consideramos una advertencia, no un error crítico
                    }
                }
            }

            if (statusCode == 1)
                return Ok(new { message });
            else
                return StatusCode(500, new { message });
        }

        [HttpGet("GetRequestedCertificatesSessions")]
        public IActionResult GetRequestedCertificatesSessions()
        {
            var dbManager = new DBManager(_config);
            var sessions = dbManager.GetRequestedCertificatesSessions();

            if (sessions == null)
                return StatusCode(500, new { message = "Error al obtener las sesiones con constancias solicitadas" });

            return Ok(sessions);
        }

        [HttpPost("UploadCertificateOfficialLetter")]
        public async Task<IActionResult> UploadCertificateOfficialLetter([FromForm] UploadCertificateOfficialLetterDTO request)
        {
            if (request.File == null || request.File.Length == 0)
                return BadRequest(new { message = "El archivo es obligatorio" });

            if (request.NumberOfCertificates < 0)
                return BadRequest(new { message = "El número de constancias debe ser mayor o igual a 0" });

            try
            {
                // 1. Obtener carpeta asignada a la sesión
                var folderName = await _dbManager.GetCourseSessionFolder(request.SessionId);
                if (string.IsNullOrEmpty(folderName))
                {
                    // Si la sesión aún no tiene carpeta, creamos y asignamos una
                    folderName = Guid.NewGuid().ToString();
                    await _dbManager.AssignFolderToSession(request.SessionId, folderName);
                }

                // 2. Obtener la ruta de almacenamiento y asegurarnos de que exista
                var storagePath = _fileStorage.GetStoragePath("CertificateOfficialLetters", folderName);
                Directory.CreateDirectory(storagePath);

                // 3. Guardar el archivo físicamente
                var physicalPath = Path.Combine(storagePath, request.File.FileName);
                await _fileStorage.SaveFileAsync(request.File, physicalPath);

                // 4. Construir la ruta relativa que se grabará en la BD
                var relativePath = Path.Combine(
                    "assets",
                    _config["FileStorage:Folders:CertificateOfficialLetters"],
                    folderName,
                    request.File.FileName
                );

                // 5. Llamar a DBManager para registrar la información en la base de datos
                var result = await _dbManager.UploadCertificateOfficialLetter(request.SessionId, relativePath, request.NumberOfCertificates);

                return result.statusCode == 200
                    ? Ok(new { message = result.message })
                    : StatusCode(result.statusCode, new { message = result.message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al procesar la solicitud.", error = ex.Message });
            }
        }

        [HttpGet("GetCertificateOfficialLetter/{sessionId}")]
        public IActionResult GetCertificateOfficialLetter(int sessionId)
        {
            try
            {
                var dbManager = new DBManager(_config);
                var officialLetter = dbManager.GetCertificateOfficialLetter(sessionId);

                if (officialLetter == null)
                    return NotFound(new { message = "No se encontró el oficio de constancias para esta sesión" });

                return Ok(officialLetter);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener el oficio de constancias", error = ex.Message });
            }
        }
    }
}

