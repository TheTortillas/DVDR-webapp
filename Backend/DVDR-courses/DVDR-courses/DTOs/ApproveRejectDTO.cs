namespace DVDR_courses.DTOs
{
    public class ApproveRejectDTO
    {
        public int CourseId { get; set; }
        public string ApprovalStatus { get; set; }  // "approved" o "rejected"
        public string? AdminNotes { get; set; }     // Notas de rechazo, si aplica
    }
}
