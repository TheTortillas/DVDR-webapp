namespace DVDR_courses.DTOs
{
    public class UploadCertificateOfficialLetterDTO
    {
        public int SessionId { get; set; }
        public int NumberOfCertificates { get; set; }
        public IFormFile File { get; set; }
    }
}
