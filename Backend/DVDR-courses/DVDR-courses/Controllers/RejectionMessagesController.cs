using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using DVDR_courses.DTOs.Messages;
using Microsoft.AspNetCore.Mvc;

namespace DVDR_courses.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RejectionMessagesController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly DBManager _dbManager;

        public RejectionMessagesController(IConfiguration config)
        {
            _config = config;
            _dbManager = new DBManager(_config);
        }

        [HttpGet("GetUserRejectionMessages")]
        public IActionResult GetUserRejectionMessages([FromQuery] string username)
        {
            if (string.IsNullOrEmpty(username))
            {
                return BadRequest(new { message = "El nombre de usuario es requerido" });
            }

            var messages = _dbManager.GetUserRejectionMessages(username);
            return Ok(messages);
        }

        [HttpPut("{id}/read")]
        public IActionResult MarkMessageAsRead(int id)
        {
            var result = _dbManager.MarkRejectionMessageAsRead(id);

            if (result.statusCode == 1)
            {
                return Ok(new { message = result.message });
            }

            return BadRequest(new { message = result.message });
        }

        [HttpGet("GetUnreadMessagesCount")]
        public IActionResult GetUnreadMessagesCount([FromQuery] string username)
        {
            if (string.IsNullOrEmpty(username))
            {
                return BadRequest(new { message = "El nombre de usuario es requerido" });
            }

            var count = _dbManager.GetUnreadRejectionMessagesCount(username);
            return Ok(count);
        }
    }
}
