namespace DVDR_courses.DTOs
{
    public class User
    {
        public int id_user { get; set; } = 0;
        public string username { get; set; } = String.Empty;
        public string password { get; set; } = String.Empty;
        public string first_name { get; set; } = String.Empty;
        public string last_name { get; set; } = String.Empty;
        public string second_last_name { get; set; } = String.Empty;
        public string center { get; set; } = String.Empty;
        public DateTime created_at { get; set; } = DateTime.Now;
    }
}

