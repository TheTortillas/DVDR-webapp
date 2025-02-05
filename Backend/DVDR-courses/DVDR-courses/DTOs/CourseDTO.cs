namespace DVDR_courses.DTOs
{
    public class CourseDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Clave { get; set; }
        public string Status { get; set; }
        public string ApprovalStatus { get; set; }
        public int TotalDuration { get; set; }
        public DateTime ExpirationDate { get; set; }
        public bool IsRenewed { get; set; }
    }
}
