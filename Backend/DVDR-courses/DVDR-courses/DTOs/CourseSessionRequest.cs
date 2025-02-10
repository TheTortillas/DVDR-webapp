namespace DVDR_courses.DTOs
{
    public class CourseSessionRequest
    {
        public string CourseKey { get; set; }
        public string Period { get; set; }
        public int NumberOfParticipants { get; set; }
        public int NumberOfCertificates { get; set; }
        public decimal Cost { get; set; }
        public List<ScheduleEntry> Schedule { get; set; }
    }

    public class CourseSessionResponse
    {
        public int SessionId { get; set; }
        public string Period { get; set; }
        public int NumberOfParticipants { get; set; }
        public int NumberOfCertificates { get; set; }
        public decimal Cost { get; set; }
        public string Status { get; set; }
        public bool CertificatesRequested { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<ScheduleEntry> Schedule { get; set; }
    }

    public class ScheduleEntry
    {
        public string Date { get; set; }
        public string Start { get; set; }
        public string End { get; set; }
    }
}
