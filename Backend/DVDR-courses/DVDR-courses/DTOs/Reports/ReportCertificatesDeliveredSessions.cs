namespace DVDR_courses.DTOs.Reports
{
    public class ReportCertificatesDeliveredSessions
    {
        public int ID { get; set; }
        public string ClaveDelCurso { get; set; }
        public string NombreDelCurso { get; set; }
        public string Periodo { get; set; }
        public int ParticipantesRegistrados { get; set; }
        public int ConstanciasEntregadas { get; set; }
        public decimal Costo { get; set; }
        public string FechaDeRegistro { get; set; }
        public string Centro { get; set; }
        public string RutaDelOficio { get; set; }
    }
}