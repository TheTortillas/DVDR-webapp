public class PendingApertureDTO
{
    public int SessionId { get; set; }
    public string CourseKey { get; set; }
    public string CourseName { get; set; }
    public string Period { get; set; }
    public int NumberOfParticipants { get; set; }
    public int NumberOfCertificates { get; set; }
    public decimal Cost { get; set; }
    public string CenterName { get; set; }
    // Nuevos campos del director
    public string DirectorName { get; set; }
    public string DirectorTitle { get; set; }
    public string DirectorGender { get; set; }
    public string Modality { get; set; }
    public int TotalDuration { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalDays { get; set; }
    public string Instructors { get; set; }
    public List<ScheduleEntryDTO> Schedule { get; set; } = new List<ScheduleEntryDTO>();
}

public class ScheduleEntryDTO
{
    public string Date { get; set; }
    public string Start { get; set; }
    public string End { get; set; }
}