﻿namespace DVDR_courses.DTOs
{
    public class UploadSignedRequestLetterDTO
    {
        public int SessionId { get; set; }
        public IFormFile File { get; set; }
        public string? FolderName { get; set; }
        public string? FilePath { get; set; }
    }
}
