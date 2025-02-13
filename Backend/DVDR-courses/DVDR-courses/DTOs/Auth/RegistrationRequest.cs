namespace DVDR_courses.DTOs.Auth
{
    public class RegistrationRequest
    {
        public string username { get; set; } = string.Empty;
        public string password { get; set; } = string.Empty;
        public string center { get; set; } = string.Empty;
        public string first_name { get; set; } = string.Empty;
        public string last_name { get; set; } = string.Empty;
        public string second_last_name { get; set; } = string.Empty;
    }
}
