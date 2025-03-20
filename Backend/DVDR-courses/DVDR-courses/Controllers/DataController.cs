using DVDR_courses.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using static Org.BouncyCastle.Math.EC.ECCurve;

namespace DVDR_courses.Controllers
{
    //[Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DataController : ControllerBase
    {
        IConfiguration _config;

        public DataController(IConfiguration conf)
        {
            _config = conf;
        }


        [HttpGet("AcademicCategories", Name = "GetCategories")]
        public JsonResult GetCategories()
        {
            return new JsonResult(new DBManager(_config).get_academic_categories());
        }

        [HttpGet("DocumentTemplates", Name = "GetDocumentTemplates")]
        public JsonResult GetDocumentTemplates([FromQuery] string modality)
        {
            if (string.IsNullOrEmpty(modality))
            {
                return new JsonResult(new { error = "Modality is required." }) { StatusCode = 400 };
            }

            try
            {
                var templates = new DBManager(_config).GetDocumentTemplates(modality);
                return new JsonResult(templates);
            }
            catch (Exception ex)
            {
                return new JsonResult(new { error = ex.Message }) { StatusCode = 500 };
            }
        }

        [HttpGet("DiplomaDocumentTemplates", Name = "GetDiplomaDocumentTemplates")]
        public JsonResult GetDiplomaDocumentTemplates()
        {
            try
            {
                var templates = new DBManager(_config).GetDiplomaDocumentTemplates();
                return new JsonResult(templates);
            }
            catch (Exception ex)
            {
                return new JsonResult(new { error = ex.Message }) { StatusCode = 500 };
            }
        }

        [HttpGet("CertificateDocumentTemplates", Name = "GetCertificateDocumentTemplates")]
        public JsonResult GetCertificateDocumentTemplates()
        {
            try
            {
                var templates = new DBManager(_config).GetCertificateDocumentTemplates();
                return new JsonResult(templates);
            }
            catch (Exception ex)
            {
                return new JsonResult(new { error = ex.Message }) { StatusCode = 500 };
            }
        }

        [HttpPost("AddCenter", Name = "PostAddCenter")]
        public IActionResult AddCenter([FromBody] CenterDTO newCenter)
        {
            var db = new DBManager(_config);
            var (statusCode, message) = db.AddCenter(newCenter);
            return new JsonResult(new { statusCode, message });
        }

        [HttpPut("UpdateCenter", Name = "PostUpdateCenter")]
        public IActionResult UpdateCenter([FromBody] CenterDTO centerToUpdate)
        {
            if (centerToUpdate == null || centerToUpdate.Id <= 0)
            {
                return BadRequest(new { statusCode = -1, message = "ID de centro no válido o datos incompletos." });
            }

            var db = new DBManager(_config);
            var (statusCode, message) = db.UpdateCenter(centerToUpdate);
            return new JsonResult(new { statusCode, message });
        }

        [HttpGet("AllCenters", Name = "GetAllCenters")]
        public JsonResult GetAllCenters()
        {
            var centers = new DBManager(_config).GetAllCenters();
            return new JsonResult(centers);
        }

        [HttpGet("TutorialVideos", Name = "GetTutorialVideos")]
        public IActionResult GetTutorialVideos()
        {
            try
            {
                var videos = new DBManager(_config).GetTutorialVideos();
                return Ok(videos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error: {ex.Message}" });
            }
        }
    }
}
