namespace DVDR_courses.DTOs
{
    public class CourseWithSessionsResponse
    {
        public string Title { get; set; } // Nombre del curso
        public List<string> CourseKeys { get; set; } = new List<string>(); // Claves de los cursos (incluyendo renovaciones)
        public List<SessionResponse> Sessions { get; set; } = new List<SessionResponse>(); // Lista de sesiones del curso y sus renovaciones
    }

    public class SessionResponse
    {
        public string Clave { get; set; } // Clave del curso al que pertenece la sesión
        public string Periodo { get; set; } // Periodo de la sesión (Ene 2025 - Mar 2025)
        public int Participantes { get; set; } // Número de participantes en la sesión
        public int Constancias { get; set; } // Número de constancias entregadas
        public string Estatus { get; set; } // Estatus de la sesión (waiting, opened, concluded)
    }
}
