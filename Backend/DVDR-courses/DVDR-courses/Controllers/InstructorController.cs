using DVDR_courses.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System.Data;

namespace DVDR_courses.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InstructorController : ControllerBase
    {
        IConfiguration _config;

        public InstructorController(IConfiguration conf)
        {
            _config = conf;
        }


        [HttpPost("RegisterGeneralInfo", Name = "PostRegisterGeneralInfo")]
        public IActionResult RegisterGeneralInfo([FromBody] GeneralInfoInstructor instructor)
        {
            if (instructor == null)
            {
                return BadRequest(new { message = "El cuerpo de la solicitud no puede estar vacío." });
            }

            var dbManager = new DBManager(_config);
            var (statusCode, message) = dbManager.RegisterGeneralInfoInstructor(instructor);

            return statusCode switch
            {
                1 => Ok(new { message }),
                -2 => BadRequest(new { message }),
                _ => StatusCode(500, new { message }) // Manejo de errores genéricos
            };
        }

    }
}
