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
        public IActionResult Index()
        {
            return View();
        }
    }
}
