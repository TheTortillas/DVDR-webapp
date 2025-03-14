import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  ApertureCoursesSessionsService,
  PendingAperture,
} from '../../../core/services/apertute-courses-sessions.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

const LOGO_PATH = '/img/DVDRHorizontal.png'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-course-apertures',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './course-apertures.component.html',
  providers: [DatePipe],
})
export class CourseAperturesComponent implements OnInit {
  displayedColumns: string[] = [
    'courseKey',
    'courseName',
    'period',
    'participants',
    'cost',
    'actions',
  ];
  dataSource: PendingAperture[] = [];

  constructor(
    private apertureService: ApertureCoursesSessionsService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadPendingApertures();
  }

  loadPendingApertures(): void {
    this.apertureService.getPendingApertures().subscribe({
      next: (data: PendingAperture[]) => {
        this.dataSource = data;
      },
      error: () => {
        this.snackBar.open('Error al cargar las solicitudes', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  async onApprove(sessionId: number): Promise<void> {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx';

    fileInput.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];

      if (file) {
        this.apertureService
          .approveOrRejectSession({
            sessionId: sessionId,
            approvalStatus: 'approved',
            officialLetter: file,
          })
          .subscribe({
            next: () => {
              this.snackBar.open('Solicitud aprobada exitosamente', 'Cerrar', {
                duration: 3000,
              });
              this.loadPendingApertures();
            },
            error: (error: Error) => {
              this.snackBar.open('Error al aprobar la solicitud', 'Cerrar', {
                duration: 3000,
              });
            },
          });
      }
    };

    fileInput.click();
  }

  onReject(sessionId: number): void {
    this.apertureService
      .approveOrRejectSession({
        sessionId: sessionId,
        approvalStatus: 'rejected',
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Solicitud rechazada', 'Cerrar', {
            duration: 3000,
          });
          this.loadPendingApertures();
        },
        error: (error: Error) => {
          this.snackBar.open('Error al rechazar la solicitud', 'Cerrar', {
            duration: 3000,
          });
        },
      });
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  private to12HourFormat(time: string): string {
    if (!time) return '';
    const [hh, mm] = time.split(':').map(Number);
    const suffix = hh >= 12 ? 'pm' : 'am';
    const hour = hh % 12 || 12;
    const minute = mm < 10 ? `0${mm}` : mm;
    return `${hour}:${minute} ${suffix}`;
  }

  private printChunksWithWrap(
    doc: jsPDF,
    chunks: { text: string; bold: boolean }[],
    startX: number,
    startY: number,
    usableWidth: number,
    lineHeight: number
  ): { finalX: number; finalY: number } {
    let currentX = startX;
    let currentY = startY;
    let lineWords: { text: string; width: number; bold: boolean }[] = [];
    let currentLineWidth = 0;

    // Función para imprimir una línea justificada
    const printJustifiedLine = (
      words: typeof lineWords,
      isLastLine: boolean
    ) => {
      if (words.length === 0) return;

      // Si es la última línea o solo hay una palabra, alinear a la izquierda
      if (isLastLine || words.length === 1) {
        let x = startX;
        words.forEach((word) => {
          doc.setFont('helvetica', word.bold ? 'bold' : 'normal');
          doc.text(word.text, x, currentY);
          x += word.width;
        });
      } else {
        // Calcular espacios extra para justificación
        const totalWidth = words.reduce((sum, word) => sum + word.width, 0);
        const spaceToDistribute = usableWidth - totalWidth;
        const spaceBetweenWords = spaceToDistribute / (words.length - 1);

        let x = startX;
        words.forEach((word, index) => {
          doc.setFont('helvetica', word.bold ? 'bold' : 'normal');
          doc.text(word.text, x, currentY);
          x += word.width + (index < words.length - 1 ? spaceBetweenWords : 0);
        });
      }
      currentY += lineHeight;
    };

    // Procesar cada chunk
    for (const chunk of chunks) {
      // 1) Limpia espacios repetidos
      const splittedWords = chunk.text.trim().split(/\s+/);

      for (const word of splittedWords) {
        doc.setFont('helvetica', chunk.bold ? 'bold' : 'normal');
        const wordWidth = doc.getTextWidth(word + ' ');

        // 2) Si no cabe en la línea, se imprime la anterior y se resetea
        if (currentX + wordWidth > startX + usableWidth) {
          printJustifiedLine(lineWords, false);
          lineWords = [];
          currentLineWidth = 0;
          currentX = startX;
        }

        // 3) Añade la palabra sin anteponer espacio (" " + word)
        lineWords.push({
          text: word,
          width: wordWidth,
          bold: chunk.bold,
        });
        currentX += wordWidth;
      }
    }

    // Imprimir la última línea (sin justificar)
    if (lineWords.length > 0) {
      printJustifiedLine(lineWords, true);
    }

    return { finalX: currentX, finalY: currentY };
  }

  // ...existing code...

  async generatePDF(aperture: PendingAperture): Promise<void> {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'letter',
    });

    // Márgenes y dimensiones
    const marginX = 60;
    const marginY = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const usableWidth = pageWidth - marginX * 2;

    // Función para dibujar el encabezado (imagen y Título)
    const drawHeader = async (
      docRef: jsPDF,
      yPos: number,
      isFirstPage: boolean
    ) => {
      const img = await this.loadImage(LOGO_PATH);
      const logoWidth = 250;
      const logoHeight = 70;
      const centerXLogo = (pageWidth - logoWidth) / 2;

      docRef.addImage(img, 'PNG', centerXLogo, yPos, logoWidth, logoHeight);
      yPos += logoHeight + 20;

      docRef.setFont('helvetica', 'bold');
      docRef.setFontSize(12);
      docRef.setTextColor(0, 95, 176); // azul

      // El título cambia según la página
      const title = isFirstPage ? 'FORMATO DE AUTORIZACIÓN' : 'CRONOGRAMA';
      docRef.text(title, pageWidth / 2, yPos, {
        align: 'center',
      });
      docRef.setTextColor(0, 0, 0);

      return yPos + 30;
    };

    // 1) PRIMERA PÁGINA
    let currentY = marginY;
    currentY = await drawHeader(doc, currentY, true);

    // DESTINATARIO
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('L.C. Nancy Dalia Parra Mejía', marginX, currentY);
    currentY += 15;

    doc.setFont('helvetica', 'normal');
    doc.text(
      'Encargada de la Dirección de Vinculación y Desarrollo Regional',
      marginX,
      currentY
    );
    currentY += 15;
    doc.text('del Instituto Politécnico Nacional', marginX, currentY);
    currentY += 15;
    doc.text('Presente', marginX, currentY);
    currentY += 30;

    // TEXTO INTRO
    doc.setFontSize(10);
    const courseName = aperture.courseName || '[NOMBRE CURSO]';
    const centerName = aperture.centerName || '[NOMBRE CENTRO]';

    // Secciones con printChunksWithWrap
    const introChunks = [
      {
        text: 'Por medio del presente solicito su autorización para iniciar el servicio complementario de formación de nombre',
        bold: false,
      },
      { text: ` ${courseName}`, bold: true },
      {
        text: ' el cual se impartirá en el',
        bold: false,
      },
      { text: ` ${centerName}`, bold: true },
      {
        text: ' con los siguientes datos:',
        bold: false,
      },
    ];
    const { finalY } = this.printChunksWithWrap(
      doc,
      introChunks,
      marginX,
      currentY,
      usableWidth,
      16
    );
    currentY = finalY + 10;

    // INFO DEL CURSO
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Información del Curso', marginX, currentY);
    currentY += 10;

    const cursoBody = [
      ['Clave del Curso', aperture.courseKey],
      ['Modalidad', aperture.modality],
      ['Duración Total (hrs)', (aperture.totalDuration || 0).toString()],
    ];
    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      body: cursoBody.map(([label, value]) => [
        {
          content: label,
          styles: { fillColor: [220, 230, 241], fontStyle: 'bold' },
        },
        { content: value ?? '' },
      ]),
      styles: { fontSize: 10, cellPadding: 5 },
      margin: { left: marginX, right: marginX },
    });
    currentY = (doc as any).lastAutoTable.finalY + 20;

    // INFO DE LA SESIÓN
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Información de la Sesión', marginX, currentY);
    currentY += 10;

    // const startDateFormatted =
    //   this.datePipe.transform(
    //     aperture.startDate,
    //     'dd/MM/yyyy',
    //     undefined,
    //     'es'
    //   ) || '';
    // const endDateFormatted =
    //   this.datePipe.transform(
    //     aperture.endDate,
    //     'dd/MM/yyyy',
    //     undefined,
    //     'es'
    //   ) || '';

    const sesionBody = [
      ['Periodo', aperture.period],
      ['Participantes', (aperture.numberOfParticipants || 0).toString()],
      ['Costo', aperture.cost ? `$${aperture.cost.toFixed(2)}` : '$0.00'],
      ['Días Totales', (aperture.totalDays || 0).toString()],
    ];
    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      body: sesionBody.map(([label, value]) => [
        {
          content: label,
          styles: { fillColor: [220, 230, 241], fontStyle: 'bold' },
        },
        { content: value ?? '' },
      ]),
      styles: { fontSize: 10, cellPadding: 5 },
      margin: { left: marginX, right: marginX },
    });
    currentY = (doc as any).lastAutoTable.finalY + 20;

    // INSTRUCTORES
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Instructores', marginX, currentY);
    currentY += 10;

    let instructorsArr: string[] = [];
    if (aperture.instructors) {
      instructorsArr = aperture.instructors.split(';').map((i) => i.trim());
    }
    if (instructorsArr.length === 0) {
      instructorsArr = ['No hay instructores asignados'];
    }

    const instructorsBody = instructorsArr.map((instructor) => [
      'Nombre y rol',
      instructor,
    ]);
    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      body: instructorsBody.map(([label, value]) => [
        {
          content: label,
          styles: { fillColor: [220, 230, 241], fontStyle: 'bold' },
        },
        { content: value ?? '' },
      ]),
      styles: { fontSize: 10, cellPadding: 5 },
      margin: { left: marginX, right: marginX },
    });
    currentY = (doc as any).lastAutoTable.finalY + 80;

    // FIRMA (primera página)
    const signatureY1 = pageHeight - marginY - 80;
    doc.setLineWidth(0.5);
    doc.line(marginX, signatureY1, marginX + 200, signatureY1);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);

    const directorTitle =
      aperture.directorGender === 'H' ? 'Director' : 'Directora';
    const signatureText = [
      `${aperture.directorTitle} ${aperture.directorName}`,
      `${directorTitle} del ${aperture.centerName}`,
      'del Instituto Politécnico Nacional',
    ];

    signatureText.forEach((line, index) => {
      doc.text(line, marginX, signatureY1 + 20 + index * 15);
    });

    // Forzar fin de la primera página
    doc.addPage();

    // 2) SEGUNDA PÁGINA: Se vuelve a dibujar el encabezado
    currentY = marginY;
    currentY = await drawHeader(doc, currentY, false);

    // CRONOGRAMA
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    currentY += 5;

    const cronogramaBody = aperture.schedule.map((entry) => {
      const fechaConDia =
        this.datePipe.transform(
          entry.date,
          'EEEE dd/MM/yyyy',
          undefined,
          'es'
        ) || '';
      const start12 = this.to12HourFormat(entry.start);
      const end12 = this.to12HourFormat(entry.end);
      return [fechaConDia, start12, end12];
    });

    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      head: [['Fecha', 'Hora Inicio', 'Hora Fin']],
      body: cronogramaBody,
      headStyles: {
        fillColor: [220, 230, 241],
        textColor: [0, 0, 0], // Texto negro
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
        textColor: [0, 0, 0], // Texto negro para todas las celdas
      },
      bodyStyles: {
        textColor: [0, 0, 0], // Asegura que los nombres also sean negros
      },
      margin: { left: marginX, right: marginX },
    });
    currentY = (doc as any).lastAutoTable.finalY + 80;

    // Firma (segunda página)
    const signatureY = pageHeight - marginY - 80;
    doc.setLineWidth(0.5);
    doc.line(marginX, signatureY, marginX + 200, signatureY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    signatureText.forEach((line, index) => {
      doc.text(line, marginX, signatureY + 20 + index * 15);
    });
    currentY += 90;

    // Guardar PDF
    doc.save(`formato_autorizacion_${aperture.courseKey || 'curso'}.pdf`);
    this.snackBar.open('Reporte generado exitosamente', 'Cerrar', {
      duration: 3000,
    });
  }
}
