using DVDR_courses.DTOs.Templates;
using DVDR_courses.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace DVDR_courses.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TemplatesController : Controller
    {
        private readonly IConfiguration _config;
        private readonly DBManager _dbManager;
        private readonly FileStorageHelper _fileStorage;

        public TemplatesController(IConfiguration config, IWebHostEnvironment env)
        {
            _config = config;
            _dbManager = new DBManager(_config);
            _fileStorage = new FileStorageHelper(config, env);
        }

        [HttpPost("Manage")]
        public async Task<IActionResult> ManageTemplate([FromForm] TemplateUploadDTO request)
        {
            try
            {
                string dbFilePath = request.FilePath; // Para URLs

                if (request.File != null)
                {
                    var fileName = request.File.FileName;

                    // 1. Determinar la carpeta desde appsettings.json
                    var folderType = request.Type switch
                    {
                        "course" => "CourseTemplates",
                        "diploma" => "DiplomaTemplates",
                        "certificate" => "CertificateTemplates",
                        _ => throw new ArgumentException("Tipo de plantilla inválido")
                    };

                    // 2. Obtener la ruta física para almacenar el archivo
                    var storagePath = _fileStorage.GetStoragePath(folderType, "");
                    Directory.CreateDirectory(storagePath);

                    // 3. Guardar el archivo físicamente
                    var physicalPath = Path.Combine(storagePath, fileName);
                    await _fileStorage.SaveFileAsync(request.File, physicalPath);

                    // 4. Obtener la ruta relativa para la base de datos
                    dbFilePath = _fileStorage.GetRelativePath(folderType, "", fileName);
                }

                // 5. Llamar a DBManager para gestionar la plantilla en la BD
                var (statusCode, message) = await _dbManager.ManageTemplate(
                    request.Action,
                    request.TemplateId,
                    request.Type,
                    request.Name,
                    dbFilePath ?? string.Empty,
                    request.File != null ? "file" : "url",
                    request.Required,
                    request.Modalities
                );

                return statusCode == 1
                    ? Ok(new { message })
                    : BadRequest(new { message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error: {ex.Message}" });
            }
        }



        [HttpGet("GetAll")]
        public IActionResult GetAllTemplates()
        {
            var templates = _dbManager.GetAllTemplates();
            return Ok(templates);
        }
    }
}
