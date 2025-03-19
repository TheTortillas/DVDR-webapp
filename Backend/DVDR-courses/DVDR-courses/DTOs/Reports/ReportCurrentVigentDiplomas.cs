namespace DVDR_courses.DTOs.Reports
{
    public class ReportCurrentVigentDiplomas
    {
        public int ID { get; set; }
        public string NombreDelDiplomado { get; set; }
        public string FechaDeRegistro { get; set; }
        public int Horas { get; set; }
        public string Modalidad { get; set; }
        public string Centro { get; set; }
        public string FechaExpiracion { get; set; }
    }
}