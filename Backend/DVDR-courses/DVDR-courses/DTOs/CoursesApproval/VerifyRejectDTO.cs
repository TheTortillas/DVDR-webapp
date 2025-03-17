namespace DVDR_courses.DTOs.CoursesApproval
{
    public class VerifyRejectDTO
    {
        public int CourseId { get; set; }
        public string VerificationStatus { get; set; }
        public string? VerificationNotes { get; set; }
    }
}
