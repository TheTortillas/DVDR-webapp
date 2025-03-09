using DVDR_courses.DTOs.Messages;
using Microsoft.AspNetCore.Mvc;

namespace DVDR_courses.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessagesController : Controller
    {
        private readonly IConfiguration _config;
        private readonly DBManager _dbManager;

        public MessagesController(IConfiguration config)
        {
            _config = config;
            _dbManager = new DBManager(_config);
        }

        [HttpPost]
        public IActionResult SendMessage([FromBody] ContactMessageDTO message)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var (statusCode, responseMessage) = _dbManager.InsertMessage(message);

            if (statusCode == 1)
            {
                return Ok(new { message = responseMessage });
            }

            return BadRequest(new { message = responseMessage });
        }
    }
}

