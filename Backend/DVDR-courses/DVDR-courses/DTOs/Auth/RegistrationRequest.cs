﻿namespace DVDR_courses.DTOs.Auth
{
    public class RegistrationRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? SecondLastName { get; set; }
        public string? CenterName { get; set; }
        public string Role { get; set; } = "user";
    }
}
