namespace DVDR_courses.DTOs.Templates
{
    public class TemplateUploadDTO
    {
        public IFormFile? File { get; set; }
        public string Action { get; set; } = "INSERT"; // "INSERT" o "UPDATE"
        public int? TemplateId { get; set; }
        public string Type { get; set; } // "course", "diploma", "certificate"
        public string Name { get; set; }
        public string? FilePath { get; set; } // Para URLs
        public bool Required { get; set; }
        public List<string>? Modalities { get; set; }
    }
}
