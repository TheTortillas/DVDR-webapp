using DVDR_courses.DTOs;
using Microsoft.AspNetCore.Mvc;
using System.Xml.Linq;

namespace DVDR_courses.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class FilesController : Controller
    {
        IConfiguration _config;

        public FilesController(IConfiguration conf)
        {
            _config = conf;
        }

        [HttpPost("FileUpload", Name = "PostFileUpload")]
        public async Task<IActionResult> Upload([FromForm] UploadRequest request)
        {
            if (request.Files == null || request.Files.Count == 0)
            {
                return BadRequest("No files were uploaded.");
            }

            // Validate course data
            if (string.IsNullOrEmpty(request.FileName) ||
                string.IsNullOrEmpty(request.CourseDate) ||
                string.IsNullOrEmpty(request.Center))
            {
                return BadRequest("Missing course details.");
            }

            try
            {
                // Define the path relative to the Angular project
                var angularPublicPath = Path.Combine("..", "..", "..", "Frontend", "public", "assets", "files");

                // Construct the folder name based on the provided data
                string folderName = $"{request.FileName}-{request.CourseDate}-{request.Center}";
                var uploadPath = Path.Combine(angularPublicPath, folderName);

                if (!Directory.Exists(uploadPath))
                {
                    Directory.CreateDirectory(uploadPath);
                }

                foreach (var file in request.Files)
                {
                    var filePath = Path.Combine(uploadPath, file.FileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                }

                return Ok(new { message = "Files uploaded successfully.", folderPath = uploadPath });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during the upload.", error = ex.Message });
            }
        }
        [HttpPost("UploadCourseDocumentation", Name = "PostUploadCourseDocumentation")]
        public async Task<IActionResult> UploadCourseDocumentation([FromForm] UploadCourseDocumentation request)
        {
            // Valida que vengan archivos
            if (request.Files == null || request.Files.Count == 0)
            {
                return BadRequest("No files were uploaded.");
            }

            // Carpeta base + subcarpeta: \Frontend\public\assets\files\courses-documentation\{FolderName}\
            var angularPublicPath = Path.Combine("..", "..", "..", "Frontend", "public", "assets", "files", "courses-documentation");
            string uploadPath = Path.Combine(angularPublicPath, request.FolderName);

            try
            {
                if (!Directory.Exists(uploadPath))
                {
                    Directory.CreateDirectory(uploadPath);
                }

                foreach (var file in request.Files)
                {
                    var filePath = Path.Combine(uploadPath, file.FileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                }

                return Ok(new { message = "Files uploaded successfully.", folderPath = uploadPath });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during the upload.", error = ex.Message });
            }
        }
    }
}
