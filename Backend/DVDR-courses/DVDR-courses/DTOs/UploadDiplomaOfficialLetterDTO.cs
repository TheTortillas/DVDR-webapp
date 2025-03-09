namespace DVDR_courses.DTOs
{
    public class UploadDiplomaOfficialLetterDTO
    {
        public int DiplomaId { get; set; }
        public int NumberOfCertificates { get; set; }
        public IFormFile File { get; set; }
    }

    public class DiplomaCertificateRequestModel
    {
        public int DiplomaId { get; set; }
        public string Title { get; set; }
        public string Period { get; set; }
        public int NumberOfCertificates { get; set; }
        public string Status { get; set; }
        public List<DiplomaCertificateDocumentModel> Documents { get; set; } = new List<DiplomaCertificateDocumentModel>();
    }

    public class DiplomaCertificateDocumentModel
    {
        public int DocumentId { get; set; }
        public string Name { get; set; }
        public string FilePath { get; set; }
    }
}
