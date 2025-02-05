namespace DVDR_courses.DTOs
{
    public class CertificateRequestDTO
    {
        public int SessionId { get; set; }
        public List<CertificateDocumentDTO> Documents { get; set; }
    }

    public class CertificateDocumentDTO
    {
        public int DocumentId { get; set; }
        public IFormFile File { get; set; }
    }
}
