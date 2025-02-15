namespace DVDR_courses.DTOs
{
    public class SessionResponseRC
    {
        public int SessionId { get; set; }
        public int CourseId { get; set; }
        public string CourseName { get; set; }
        public string CourseKey { get; set; }
        public string Period { get; set; }
        public int NumberOfParticipants { get; set; }
        public int NumberOfCertificates { get; set; }
        public decimal Cost { get; set; }
        public string Status { get; set; }
        public bool CertificatesRequested { get; set; }
        public bool CertificatesDelivered { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<DocumentResponse> Documents { get; set; } = new List<DocumentResponse>();
    }
}
