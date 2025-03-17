namespace DVDR_courses.DTOs
{
    public class DiplomaRegistrationRequest
    {
        public string Username { get; set; }
        public List<DiplomaDocumentDTO> Documents { get; set; }
        public string FolderName { get; set; }
    }

    public class DiplomaDocumentDTO
    {
        public int DocumentId { get; set; }
        public IFormFile File { get; set; }
    }

    public class DiplomaApprovalDTO
    {
        public string Name { get; set; }
        public int TotalDuration { get; set; }
        public string DiplomaKey { get; set; }
        public string ServiceType { get; set; }
        public string Modality { get; set; }
        public string EducationalOffer { get; set; }
        public decimal Cost { get; set; }
        public int Participants { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime ExpirationDate { get; set; }
        public string Username { get; set; }
        public List<ActorRoleDTO> ActorRoles { get; set; }
    }

    public class ActorRoleDTO
    {
        public int ActorId { get; set; }
        public string Role { get; set; }
    }
    public class DiplomaFullDataDTO
    {
        public int? DiplomaId { get; set; }
        public string? Name { get; set; }
        public int? TotalDuration { get; set; }
        public string? DiplomaKey { get; set; }
        public string? ServiceType { get; set; }
        public string? Modality { get; set; }
        public string? EducationalOffer { get; set; }
        public string? Status { get; set; }
        public string? ApprovalStatus { get; set; }
        public string? VerificationStatus { get; set; }
        public decimal? Cost { get; set; }
        public int? Participants { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime? ExpirationDate { get; set; }
        public string? Center { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? RegisteredBy { get; set; }
        public string? FolderName { get; set; }
        public List<DiplomaActorDTO>? Actors { get; set; } = new List<DiplomaActorDTO>();
        public List<DiplomaDocumentationDTO>? Documentation { get; set; } = new List<DiplomaDocumentationDTO>();
    }

    public class DiplomaApprovalRequest
    {
        public int DiplomaId { get; set; }
        public string Name { get; set; }
        public int TotalDuration { get; set; }
        public string DiplomaKey { get; set; }
        public string ServiceType { get; set; }
        public string Modality { get; set; }
        public string EducationalOffer { get; set; }
        public decimal Cost { get; set; }
        public int Participants { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime ExpirationDate { get; set; }
        public string Username { get; set; }
        public List<ActorRoleDTO> ActorRoles { get; set; }
        public string? ApprovalStatus { get; set; }

    }
    public class DiplomaActorDTO
    {
        public int ActorId { get; set; }
        public string Name { get; set; }
        public string Role { get; set; }
    }

    public class DiplomaDocumentationDTO
    {
        public int DocumentId { get; set; }
        public string Name { get; set; }
        public string FilePath { get; set; }
        public DateTime UploadedAt { get; set; }
    }

    public class CompletedDiplomaDTO
    {
        public int DiplomaId { get; set; }
        public string Title { get; set; }
        public string DiplomaKey { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public bool CertificatesRequested { get; set; }
        public bool CertificatesDelivered { get; set; }
    }

    public class DiplomaCertificateRequestDTO
    {
        public int DiplomaId { get; set; }
        public List<DiplomaDocumentDTO> Documents { get; set; }
        public string? FolderName { get; set; }
    }

    public class SingleDiplomaDocumentRequest
    {
        public int DiplomaId { get; set; }
        public int DocumentId { get; set; }
        public IFormFile File { get; set; }
        public string FolderName { get; set; }
    }

    public class DiplomaVerificationRequest
    {
        public int DiplomaId { get; set; }
        public string VerificationStatus { get; set; } // "approved" o "rejected"
        public string? VerificationNotes { get; set; }
    }
}
