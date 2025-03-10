namespace DVDR_courses.DTOs.Instructor
{
    public class InstructorFullDataDTO
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? SecondLastName { get; set; }
        public string Email { get; set; } = string.Empty;
        public string KnowledgeArea { get; set; } = string.Empty;
        public string CenterName { get; set; } = string.Empty;
        public List<AcademicHistoryDTO> AcademicHistories { get; set; } = new List<AcademicHistoryDTO>();
        public List<ProfessionalExperienceDTO> ProfessionalExperiences { get; set; } = new List<ProfessionalExperienceDTO>();
    }

    public class AcademicHistoryDTO
    {
        public string EducationLevel { get; set; } = string.Empty;
        public string Period { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
        public string DegreeAwarded { get; set; } = string.Empty;
        public string EvidencePath { get; set; } = string.Empty;
    }

    public class ProfessionalExperienceDTO
    {
        public string Period { get; set; } = string.Empty;
        public string Organization { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public string Activity { get; set; } = string.Empty;
        public string EvidencePath { get; set; } = string.Empty;
    }
}