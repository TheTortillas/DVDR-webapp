namespace DVDR_courses.DTOs.Auth
{
    public class UpdatePasswordRequest
    {
        public string Username { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
