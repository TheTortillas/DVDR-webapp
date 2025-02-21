namespace DVDR_courses.DTOs
{
    public class CourseRegister
    {
        public CourseInfo CourseInfo { get; set; }
        public List<Document> Documents { get; set; }
        public string Username { get; set; }
        public string FolderName { get; set; }
        public int? ParentCourseId { get; set; } // Nuevo: ID del curso a renovar
        public bool IsRenewed { get; set; }
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

    public class CourseResponse
    {
        public int CourseId { get; set; }
        public string CourseKey { get; set; }
        public CourseInfo CourseInfo { get; set; }
        public List<DocumentResponse> Documents { get; set; }
        public string CreatedBy { get; set; } // Usuario que creó el curso
        public int? ParentCourseId { get; set; }
        public int RenewalCount { get; set; }
        public DateTime ExpirationDate { get; set; }
        public bool IsRenewed { get; set; }
        public DateTime CreatedAt { get; set; } // Incluir la fecha de creación
        public string Status { get; set; } // Incluir el status
        public string ApprovalStatus { get; set; } // Incluir el approval_status
        public string AdminNotes { get; set; } // Incluir las notas del administrador
        public string Center { get; set; }
    }

    public class DocumentResponse
    {
        public int DocumentId { get; set; }
        public string Name { get; set; }
        public string FilePath { get; set; } // Ruta en lugar de IFormFile
    }
}
