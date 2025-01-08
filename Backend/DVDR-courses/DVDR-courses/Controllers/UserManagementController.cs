using DVDR_courses.DTOs;
using DVDR_courses.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using static Org.BouncyCastle.Math.EC.ECCurve;

namespace DVDR_courses.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class UserManagementController : ControllerBase
    {
        IConfiguration _config;

        public UserManagementController(IConfiguration conf)
        {
            _config = conf;
        }

        //[HttpPost("SignUp", Name = "PostSignUp")]
        //public JsonResult post([FromBody] UserSignUp usr)
        //{
        //    return new JsonResult(new DBManager(_config).sign_up(
        //        usr.username,
        //        usr.password,
        //        usr.first_name,
        //        usr.last_name,
        //        usr.second_last_name,
        //        usr.center));
        //}

        [HttpPost("SignIn", Name = "PostSignIn")]
        public IActionResult SignIn([FromBody] UserSignIn usr)
        {
            var result = new DBManager(_config).sign_in(usr.username, usr.password);

            if (result == null)
                return Unauthorized(new { message = "Invalid credentials" });

            return Ok(result);
        }

        [HttpPost("RefreshToken", Name = "PostRefreshToken")]
        public IActionResult RefreshToken()
        {
            var authHeader = Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                return Unauthorized(new { message = "Token no proporcionado." });
            }

            var token = authHeader.Substring("Bearer ".Length).Trim();

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_config["JWTSettings:securityKey"]);

            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = _config["JWTSettings:validIssuer"],
                    ValidAudience = _config["JWTSettings:validAudience"],
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ClockSkew = TimeSpan.Zero // Evita márgenes de tiempo
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                var username = jwtToken.Subject;

                // Genera un nuevo token
                var jwtService = new JwtService(_config);
                var newToken = jwtService.GenerateToken(username);

                return Ok(new { token = newToken });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al validar el token: {ex.Message}");
                return Unauthorized(new { message = "Token inválido o expirado." });
            }
        }
    }
}
