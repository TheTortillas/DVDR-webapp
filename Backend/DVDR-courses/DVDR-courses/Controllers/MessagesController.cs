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

        [HttpPost("SentContactUsMessage", Name = "PostSentContactUsMessage")]
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

        [HttpGet("GetAllContactUsMessages")]
        public IActionResult GetAllMessages()
        {
            var messages = _dbManager.GetAllMessages();
            return Ok(messages);
        }

        [HttpPut("{id}/status")]
        public IActionResult UpdateMessageStatus(int id, [FromBody] MessageUpdateDTO update)
        {
            if (id != update.Id)
            {
                return BadRequest(new { message = "ID en la URL no coincide con el ID en el cuerpo de la petición" });
            }

            if (string.IsNullOrEmpty(update.AttendedBy))
            {
                return BadRequest(new { message = "Se requiere el nombre de usuario del administrador" });
            }

            var result = _dbManager.UpdateMessageStatus(update);

            if (result.statusCode == 1)
            {
                return Ok(new { message = result.message });
            }

            return BadRequest(new { message = result.message });
        }
    }
}

