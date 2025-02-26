namespace DVDR_courses.DTOs
{
    public class DocumentTemplate
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string FilePath { get; set; }
        public string Type { get; set; } // Puede ser 'file' o 'url'
        public bool Required { get; set; } = true;
    }
}
