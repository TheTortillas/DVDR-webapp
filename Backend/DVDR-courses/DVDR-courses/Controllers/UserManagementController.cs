﻿using DVDR_courses.DTOs.Auth;
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
        private readonly DBManager _dbManager;

        public UserManagementController(IConfiguration conf)
        {
            _config = conf;
            _dbManager = new DBManager(_config);
        }

        [HttpPost("SignIn", Name = "PostSignIn")]
        public IActionResult SignIn([FromBody] LoginRequest usr)
        {
            var result = new DBManager(_config).sign_in(usr.username, usr.password);

            if (result == null)
                return Unauthorized(new { message = "Invalid credentials" });

            return Ok(result);
        }

        [HttpGet("GetAllUsers")]
        public IActionResult GetAllUsers()
        {
            var users = _dbManager.GetAllUsers();
            return Ok(users);
        }

        [HttpPost("SignUp", Name = "PostSignUp")]
        public IActionResult CreateUser([FromBody] RegistrationRequest user)
        {
            var result = _dbManager.CreateUser(user);
            if (result.statusCode == 1)
            {
                return Ok(new { message = result.message });
            }

            return BadRequest(new { message = result.message });
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

            try
            {
                var jwtService = new JwtService(_config);
                var newToken = jwtService.RefreshToken(token);
                return Ok(new { token = newToken });
            }
            catch (SecurityTokenException ex)
            {
                Console.WriteLine($"Error al validar el token: {ex.Message}");
                return Unauthorized(new { message = "Token inválido o expirado." });
            }
        }

        [HttpPost("UpdatePassword", Name = "PostUpdatePassword")]
        public IActionResult UpdatePassword([FromBody] UpdatePasswordRequest request)
        {
            var result = _dbManager.UpdateUserPassword(request);
            if (result.statusCode == 1)
            {
                return Ok(new { message = result.message });
            }
            return BadRequest(new { message = result.message });
        }
    }
}
