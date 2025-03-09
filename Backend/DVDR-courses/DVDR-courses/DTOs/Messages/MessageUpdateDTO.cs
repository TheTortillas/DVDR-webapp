namespace DVDR_courses.DTOs.Messages
{
    public class MessageUpdateDTO
    {
        public int Id { get; set; }
        public bool Attended { get; set; }
        public string AttendedBy { get; set; } = string.Empty;
    }
}
