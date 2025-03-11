namespace DVDR_courses.DTOs.Data
{
    public class TutorialVideoDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string VideoUrl { get; set; } = string.Empty;
        public string ThumbnailUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
