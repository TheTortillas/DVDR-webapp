namespace DVDR_courses.DTOs
{
    public class UploadRequest
    {
        public string FileName { get; set; }
        public string CourseDate { get; set; }
        public string Center { get; set; }
        public List<IFormFile> Files { get; set; }
    }
}
