namespace DVDR_courses.DTOs.Messages
{
    public class RejectionMessageDTO
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public int UserId { get; set; }
        public string CenterName { get; set; }
        public string RejectionType { get; set; }
        public string Subject { get; set; }
        public string AdminNotes { get; set; }
        public string VerificationNotes { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool ReadStatus { get; set; }
        public DateTime? ReadAt { get; set; }
    }
}

