namespace DVDR_courses.DTOs
{
    public class CourseRegister
    {
        public CourseInfo CourseInfo { get; set; }
        public List<Document> Documents { get; set; }
        public string Username { get; set; }
        public string FolderName { get; set; }
        public int? ParentCourseId { get; set; } // Nuevo: ID del curso a renovar
    }

    public class CourseInfo
    {
        public string CourseName { get; set; }
        public string ServiceType { get; set; }
        public string Category { get; set; }
        public string? Agreement { get; set; }
        public int? TotalDuration { get; set; }
        public string Modality { get; set; }
        public string EducationalOffer { get; set; }
        public List<string>? EducationalPlatform { get; set; }
        public string? CustomPlatform { get; set; }
        public List<Actor> Actors { get; set; }
    }

    public class Document
    {
        public int DocumentId { get; set; }
        public string Name { get; set; }
        public bool Required { get; set; }
        public IFormFile File { get; set; } // Archivo cargado
    }

    public class Actor
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Role { get; set; }
    }
}
