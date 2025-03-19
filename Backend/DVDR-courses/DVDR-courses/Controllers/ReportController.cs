using DVDR_courses.DTOs.Reports;
using Microsoft.AspNetCore.Mvc;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.ComponentModel;
using System.Drawing;

namespace DVDR_courses.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly DBManager _dbManager;

        public ReportController(IConfiguration config)
        {
            _config = config;
            _dbManager = new DBManager(_config);
            // Configure EPPlus to use NonCommercial mode
            ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;
        }

        [HttpGet("CurrentVigentCourses")]
        public IActionResult GetCurrentVigentCourses()
        {
            try
            {
                var courses = _dbManager.GetCurrentVigentCourses();

                if (courses == null || !courses.Any())
                {
                    return Ok(new { message = "No hay cursos vigentes disponibles", data = new List<object>() });
                }

                return Ok(courses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los cursos vigentes", error = ex.Message });
            }
        }

        [HttpGet("CurrentVigentDiplomas")]
        public IActionResult GetCurrentVigentDiplomas()
        {
            try
            {
                var diplomas = _dbManager.GetCurrentVigentDiplomas();

                if (diplomas == null || !diplomas.Any())
                {
                    return Ok(new { message = "No hay diplomados vigentes disponibles", data = new List<object>() });
                }

                return Ok(diplomas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los diplomados vigentes", error = ex.Message });
            }
        }

        [HttpGet("CertificatesDeliveredSessions")]
        public IActionResult GetCertificatesDeliveredSessions()
        {
            try
            {
                var sessions = _dbManager.GetCertificatesDeliveredSessions();

                if (sessions == null || !sessions.Any())
                {
                    return Ok(new { message = "No hay sesiones con constancias entregadas", data = new List<object>() });
                }

                return Ok(sessions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener las sesiones con constancias", error = ex.Message });
            }
        }

        [HttpGet("CertificatesDeliveredDiplomas")]
        public IActionResult GetCertificatesDeliveredDiplomas()
        {
            try
            {
                var diplomas = _dbManager.GetCertificatesDeliveredDiplomas();

                if (diplomas == null || !diplomas.Any())
                {
                    return Ok(new { message = "No hay diplomados con constancias entregadas", data = new List<object>() });
                }

                return Ok(diplomas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los diplomados con constancias", error = ex.Message });
            }
        }

        [HttpGet("ExportCurrentVigentCourses")]
        public IActionResult ExportCurrentVigentCourses()
        {
            try
            {
                var courses = _dbManager.GetCurrentVigentCourses();

                if (courses == null || !courses.Any())
                {
                    return NotFound(new { message = "No hay cursos vigentes disponibles para exportar" });
                }

                // Generar Excel
                var stream = new MemoryStream();
                using (var package = new ExcelPackage(stream))
                {
                    var worksheet = package.Workbook.Worksheets.Add("Cursos Vigentes");

                    // Estilo para encabezados
                    var headerStyle = worksheet.Cells["A1:G1"].Style;
                    headerStyle.Font.Bold = true;
                    headerStyle.Fill.PatternType = ExcelFillStyle.Solid;
                    headerStyle.Fill.BackgroundColor.SetColor(Color.LightBlue);
                    headerStyle.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    // Establecer encabezados
                    worksheet.Cells[1, 1].Value = "ID";
                    worksheet.Cells[1, 2].Value = "NOMBRE DEL CURSO";
                    worksheet.Cells[1, 3].Value = "FECHA DE REGISTRO";
                    worksheet.Cells[1, 4].Value = "HORAS";
                    worksheet.Cells[1, 5].Value = "MODALIDAD";
                    worksheet.Cells[1, 6].Value = "CENTRO";
                    worksheet.Cells[1, 7].Value = "FECHA EXPIRACIÓN";

                    // Llenar datos
                    int row = 2;
                    foreach (var course in courses)
                    {
                        worksheet.Cells[row, 1].Value = course.ID;
                        worksheet.Cells[row, 2].Value = course.NombreDelCurso;
                        worksheet.Cells[row, 3].Value = course.FechaDeRegistro;
                        worksheet.Cells[row, 4].Value = course.Horas;
                        worksheet.Cells[row, 5].Value = course.Modalidad;
                        worksheet.Cells[row, 6].Value = course.Centro;
                        worksheet.Cells[row, 7].Value = course.FechaExpiracion;
                        row++;
                    }

                    // Autoajustar columnas
                    worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

                    package.Save();
                }

                stream.Position = 0;
                string fileName = $"Cursos_Vigentes_{DateTime.Now:yyyyMMdd}.xlsx";

                return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al exportar los cursos vigentes", error = ex.Message });
            }
        }

        [HttpGet("ExportCurrentVigentDiplomas")]
        public IActionResult ExportCurrentVigentDiplomas()
        {
            try
            {
                var diplomas = _dbManager.GetCurrentVigentDiplomas();

                if (diplomas == null || !diplomas.Any())
                {
                    return NotFound(new { message = "No hay diplomados vigentes disponibles para exportar" });
                }

                // Generar Excel
                var stream = new MemoryStream();
                using (var package = new ExcelPackage(stream))
                {
                    var worksheet = package.Workbook.Worksheets.Add("Diplomados Vigentes");

                    // Estilo para encabezados
                    var headerStyle = worksheet.Cells["A1:G1"].Style;
                    headerStyle.Font.Bold = true;
                    headerStyle.Fill.PatternType = ExcelFillStyle.Solid;
                    headerStyle.Fill.BackgroundColor.SetColor(Color.LightBlue);
                    headerStyle.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    // Establecer encabezados
                    worksheet.Cells[1, 1].Value = "ID";
                    worksheet.Cells[1, 2].Value = "NOMBRE DEL DIPLOMADO";
                    worksheet.Cells[1, 3].Value = "FECHA DE REGISTRO";
                    worksheet.Cells[1, 4].Value = "HORAS";
                    worksheet.Cells[1, 5].Value = "MODALIDAD";
                    worksheet.Cells[1, 6].Value = "CENTRO";
                    worksheet.Cells[1, 7].Value = "FECHA EXPIRACIÓN";

                    // Llenar datos
                    int row = 2;
                    foreach (var diploma in diplomas)
                    {
                        worksheet.Cells[row, 1].Value = diploma.ID;
                        worksheet.Cells[row, 2].Value = diploma.NombreDelDiplomado;
                        worksheet.Cells[row, 3].Value = diploma.FechaDeRegistro;
                        worksheet.Cells[row, 4].Value = diploma.Horas;
                        worksheet.Cells[row, 5].Value = diploma.Modalidad;
                        worksheet.Cells[row, 6].Value = diploma.Centro;
                        worksheet.Cells[row, 7].Value = diploma.FechaExpiracion;
                        row++;
                    }

                    // Autoajustar columnas
                    worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

                    package.Save();
                }

                stream.Position = 0;
                string fileName = $"Diplomados_Vigentes_{DateTime.Now:yyyyMMdd}.xlsx";

                return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al exportar los diplomados vigentes", error = ex.Message });
            }
        }

        [HttpGet("ExportCertificatesDeliveredSessions")]
        public IActionResult ExportCertificatesDeliveredSessions()
        {
            try
            {
                var sessions = _dbManager.GetCertificatesDeliveredSessions();

                if (sessions == null || !sessions.Any())
                {
                    return NotFound(new { message = "No hay sesiones con constancias entregadas para exportar" });
                }

                // Generar Excel
                var stream = new MemoryStream();
                using (var package = new ExcelPackage(stream))
                {
                    var worksheet = package.Workbook.Worksheets.Add("Constancias Entregadas - Cursos");

                    // Estilo para encabezados
                    var headerStyle = worksheet.Cells["A1:J1"].Style;
                    headerStyle.Font.Bold = true;
                    headerStyle.Fill.PatternType = ExcelFillStyle.Solid;
                    headerStyle.Fill.BackgroundColor.SetColor(Color.LightBlue);
                    headerStyle.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    // Establecer encabezados
                    worksheet.Cells[1, 1].Value = "ID";
                    worksheet.Cells[1, 2].Value = "CLAVE DEL CURSO";
                    worksheet.Cells[1, 3].Value = "NOMBRE DEL CURSO";
                    worksheet.Cells[1, 4].Value = "PERIODO";
                    worksheet.Cells[1, 5].Value = "PARTICIPANTES REGISTRADOS";
                    worksheet.Cells[1, 6].Value = "CONSTANCIAS ENTREGADAS";
                    worksheet.Cells[1, 7].Value = "COSTO";
                    worksheet.Cells[1, 8].Value = "FECHA DE REGISTRO";
                    worksheet.Cells[1, 9].Value = "CENTRO";
                    worksheet.Cells[1, 10].Value = "RUTA DEL OFICIO";

                    // Llenar datos
                    int row = 2;
                    foreach (var session in sessions)
                    {
                        worksheet.Cells[row, 1].Value = session.ID;
                        worksheet.Cells[row, 2].Value = session.ClaveDelCurso;
                        worksheet.Cells[row, 3].Value = session.NombreDelCurso;
                        worksheet.Cells[row, 4].Value = session.Periodo;
                        worksheet.Cells[row, 5].Value = session.ParticipantesRegistrados;
                        worksheet.Cells[row, 6].Value = session.ConstanciasEntregadas;
                        worksheet.Cells[row, 7].Value = session.Costo;
                        worksheet.Cells[row, 8].Value = session.FechaDeRegistro;
                        worksheet.Cells[row, 9].Value = session.Centro;
                        worksheet.Cells[row, 10].Value = session.RutaDelOficio;
                        row++;
                    }

                    // Autoajustar columnas
                    worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

                    package.Save();
                }

                stream.Position = 0;
                string fileName = $"Constancias_Entregadas_Cursos_{DateTime.Now:yyyyMMdd}.xlsx";

                return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al exportar las sesiones con constancias", error = ex.Message });
            }
        }

        [HttpGet("ExportCertificatesDeliveredDiplomas")]
        public IActionResult ExportCertificatesDeliveredDiplomas()
        {
            try
            {
                var diplomas = _dbManager.GetCertificatesDeliveredDiplomas();

                if (diplomas == null || !diplomas.Any())
                {
                    return NotFound(new { message = "No hay diplomados con constancias entregadas para exportar" });
                }

                // Generar Excel
                var stream = new MemoryStream();
                using (var package = new ExcelPackage(stream))
                {
                    var worksheet = package.Workbook.Worksheets.Add("Constancias Entregadas - Diplomados");

                    // Estilo para encabezados
                    var headerStyle = worksheet.Cells["A1:K1"].Style;
                    headerStyle.Font.Bold = true;
                    headerStyle.Fill.PatternType = ExcelFillStyle.Solid;
                    headerStyle.Fill.BackgroundColor.SetColor(Color.LightBlue);
                    headerStyle.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    // Establecer encabezados
                    worksheet.Cells[1, 1].Value = "ID";
                    worksheet.Cells[1, 2].Value = "NOMBRE DEL DIPLOMADO";
                    worksheet.Cells[1, 3].Value = "CLAVE";
                    worksheet.Cells[1, 4].Value = "HORAS";
                    worksheet.Cells[1, 5].Value = "MODALIDAD";
                    worksheet.Cells[1, 6].Value = "FECHA INICIO";
                    worksheet.Cells[1, 7].Value = "FECHA FIN";
                    worksheet.Cells[1, 8].Value = "PARTICIPANTES REGISTRADOS";
                    worksheet.Cells[1, 9].Value = "CONSTANCIAS EMITIDAS";
                    worksheet.Cells[1, 10].Value = "CENTRO";
                    worksheet.Cells[1, 11].Value = "RUTA DEL OFICIO";

                    // Llenar datos
                    int row = 2;
                    foreach (var diploma in diplomas)
                    {
                        worksheet.Cells[row, 1].Value = diploma.ID;
                        worksheet.Cells[row, 2].Value = diploma.NombreDelDiplomado;
                        worksheet.Cells[row, 3].Value = diploma.Clave;
                        worksheet.Cells[row, 4].Value = diploma.Horas;
                        worksheet.Cells[row, 5].Value = diploma.Modalidad;
                        worksheet.Cells[row, 6].Value = diploma.FechaInicio;
                        worksheet.Cells[row, 7].Value = diploma.FechaFin;
                        worksheet.Cells[row, 8].Value = diploma.ParticipantesRegistrados;
                        worksheet.Cells[row, 9].Value = diploma.ConstanciasEmitidas;
                        worksheet.Cells[row, 10].Value = diploma.Centro;
                        worksheet.Cells[row, 11].Value = diploma.RutaDelOficio;
                        row++;
                    }

                    // Autoajustar columnas
                    worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

                    package.Save();
                }

                stream.Position = 0;
                string fileName = $"Constancias_Entregadas_Diplomados_{DateTime.Now:yyyyMMdd}.xlsx";

                return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al exportar los diplomados con constancias", error = ex.Message });
            }
        }
    }
}