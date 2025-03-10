using DVDR_courses.DTOs.Templates;
using Microsoft.AspNetCore.Mvc;

namespace DVDR_courses.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TemplatesController : Controller
    {
        private readonly IConfiguration _config;
        private readonly DBManager _dbManager;

        public TemplatesController(IConfiguration config)
        {
            _config = config;
            _dbManager = new DBManager(_config);
        }

        [HttpPost("Manage")]
        public async Task<IActionResult> ManageTemplate([FromForm] TemplateUploadDTO request)
        {
            try
            {
                string dbFilePath = request.FilePath; // Para URLs

                if (request.File != null)
                {
                    var fileName = request.File.FileName; // Usar el nombre original del archivo
                    var baseFolder = request.Type switch
                    {
                        "course" => "templates",
                        "diploma" => "diplomae_templates",
                        "certificate" => "certificate_documents_templates",
                        _ => throw new ArgumentException("Tipo de plantilla inválido")
                    };

                    var basePath = Path.Combine("assets", baseFolder);
                    var physicalPath = Path.Combine("..", "..", "..", "Frontend", "public", basePath);
                    Directory.CreateDirectory(physicalPath);

                    var filePath = Path.Combine(physicalPath, fileName);
                    dbFilePath = Path.Combine(basePath, fileName).Replace("\\", "/");

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await request.File.CopyToAsync(stream);
                    }
                }

                // Actualizar la base de datos
                var (statusCode, message) = _dbManager.ManageTemplate(
                    request.Action,
                    request.TemplateId,
                    request.Type,
                    request.Name,
                    dbFilePath ?? string.Empty,
                    request.File != null ? "file" : "url",
                    request.Required,
                    request.Modalities
                );

                if (statusCode == 1)
                {
                    return Ok(new { message });
                }
                return BadRequest(new { message });
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
