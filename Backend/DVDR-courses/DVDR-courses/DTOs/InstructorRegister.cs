namespace DVDR_courses.DTOs
{
    public class InstructorRegister
    {
        public GeneralInfo GeneralInfo { get; set; }
        public List<AcademicHistory> AcademicHistories { get; set; }
        public List<WorkExperience> WorkExperiences { get; set; }
        public string FolderName { get; set; } // Carpeta base
    }

    public class GeneralInfo
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string SecondLastName { get; set; }
        public string Street { get; set; }
        public string Number { get; set; }
        public string Colony { get; set; }
        public string PostalCode { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; } = String.Empty;
        public string Mobile { get; set; }
        public List<string> ExpertiseAreas { get; set; }
        public string Center { get; set; }
    }

    public class AcademicHistory
    {
        public string education_level { get; set; }
        public string period { get; set; }
        public string institution { get; set; }
        public string degree_awarded { get; set; }
        public IFormFile Evidence { get; set; } // El archivo cargado desde el cliente
    }

    public class WorkExperience
    {
        public string period { get; set; }
        public string organization { get; set; }
        public string position { get; set; }
        public string activity { get; set; }
        public IFormFile Evidence { get; set; } // El archivo cargado desde el cliente
    }
}
