namespace DVDR_courses.DTOs.Reports
{
    public class ReportCertificatesDeliveredDiplomas
    {
        public int ID { get; set; }
        public string NombreDelDiplomado { get; set; }
        public string Clave { get; set; }
        public int Horas { get; set; }
        public string Modalidad { get; set; }
        public string FechaInicio { get; set; }
        public string FechaFin { get; set; }
        public int ParticipantesRegistrados { get; set; }
        public int ConstanciasEmitidas { get; set; }
        public string Centro { get; set; }
        public string RutaDelOficio { get; set; }
    }
}