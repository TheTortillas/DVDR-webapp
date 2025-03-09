namespace DVDR_courses.DTOs.Messages
{
    public class MessageDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
        public bool Attended { get; set; }
        public DateTime? AttendedAt { get; set; }
        public string? AttendedByName { get; set; }
    }
}
