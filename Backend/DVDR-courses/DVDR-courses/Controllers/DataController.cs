using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using static Org.BouncyCastle.Math.EC.ECCurve;

namespace DVDR_courses.Controllers
{
    [Authorize]
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
        public JsonResult GetDocumentTemplates()
        {
            return new JsonResult(new DBManager(_config).GetDocumentTemplates());
        }

    }

}
