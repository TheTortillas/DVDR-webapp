import { Component, inject } from '@angular/core';
import { ScheduleDialogComponent } from '../../../shared/components/schedule-dialog/schedule-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute } from '@angular/router';
import { MatDivider } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ApertureStateService } from '../../../core/services/aperture-state.service';
import { ApertureCoursesSessionsService } from '../../../core/services/apertute-courses-sessions.service';

import { ViewScheduleDialogComponent } from './view-schedule-dialog/view-schedule-dialog.component';

interface ScheduleEntry {
  dateKey?: string;
  dateDisplay: string;
  start: string;
  end: string;
  date?: string;
}

@Component({
  selector: 'app-aperture-info',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDivider,
    MatRadioModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './aperture-info.component.html',
  styleUrl: './aperture-info.component.scss',
})
export class ApertureInfoComponent {
  //-------------------------------------- DIALOG CRONOGRAMA  ---------------------------------------
  readonly dialog = inject(MatDialog);

  title = '';
  clave = '';
  totalDuration = 0;

  displayedColumns: string[] = ['dateDisplay', 'start', 'end'];

  generatedSchedule: ScheduleEntry[] = [];

  // Definir el FormGroup para las validaciones
  solicitudForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private apertureState: ApertureStateService,
    private router: Router,
    private apertureCoursesService: ApertureCoursesSessionsService
  ) {
    this.route.queryParams.subscribe((params) => {
      this.title = params['title'] || '';
      this.clave = params['clave'] || '';
      this.totalDuration = params['totalDuration'] || 0;
    });

    // Inicializar el formulario con validaciones
    this.solicitudForm = this.fb.group({
      costoUnitario: ['', [Validators.required, Validators.min(0)]],
      numParticipantes: ['', [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit() {
    // Validar que se acceda correctamente con datos del curso
    if (!this.apertureState.validateAccess()) {
      return;
    }

    const courseInfo = this.apertureState.getApertureInfo();
    if (courseInfo) {
      this.title = courseInfo.title;
      this.clave = courseInfo.clave;
      this.totalDuration = courseInfo.totalDuration;
    }
  }

  ngOnDestroy() {
    // Limpiar el estado al salir del componente
    this.apertureState.clearApertureInfo();
  }

  openDialog(
    enterAnimationDuration: string,
    exitAnimationDuration: string
  ): void {
    const dialogRef = this.dialog.open(ScheduleDialogComponent, {
      data: { totalDuration: this.totalDuration, enableDateFilter: false },
      autoFocus: false,
      maxWidth: '100vh',
      maxHeight: '100vh',
      width: '45%',
      height: '65%h',
      enterAnimationDuration,
      exitAnimationDuration,
    });

    // Apenas se abre el diálogo, vaciamos la tabla de Fechas Personalizadas
    dialogRef.afterOpened().subscribe(() => {
      if (dialogRef.componentInstance.customScheduleComponent) {
        dialogRef.componentInstance.customScheduleComponent.dataSource = [];
      }
    });

    dialogRef.afterClosed().subscribe((result: ScheduleEntry[] | undefined) => {
      if (result && result.length > 0) {
        this.generatedSchedule = result;
      }
    });
  }

  viewSchedule() {
    this.dialog.open(ViewScheduleDialogComponent, {
      data: { schedule: this.generatedSchedule },
      autoFocus: false,
      width: '45%',
      maxWidth: '100vh',
      maxHeight: '100vh',
    });
  }

  // Método para manejar la solicitud de apertura del curso
  solicitarApertura(): void {
    // Primero, marcar todos los campos como tocados para mostrar errores
    this.solicitudForm.markAllAsTouched();

    // Verificar si el formulario es válido
    if (this.solicitudForm.invalid) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, llena todos los datos en el formulario.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    // Verificar si el cronograma ha sido generado
    if (this.generatedSchedule.length === 0) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, genera un cronograma antes de solicitar la apertura.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    // Obtener los valores del formulario
    const costoUnitario = this.solicitudForm.value.costoUnitario;
    const numParticipantes = this.solicitudForm.value.numParticipantes;
    const costoTotal = costoUnitario * numParticipantes;

    // Mostrar SweetAlert de confirmación
    Swal.fire({
      title: 'Enviar solicitud',
      text: `¿Está seguro de que toda su información es correcta?\n\nCosto Total del Curso: MXN ${costoTotal}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Enviar Solicitud',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Obtener los valores del formulario
        const costoUnitario = this.solicitudForm.value.costoUnitario;
        const numParticipantes = this.solicitudForm.value.numParticipantes;
        const period = this.generatePeriod();

        const sessionRequest = {
          courseKey: this.clave,
          period,
          numberOfParticipants: numParticipantes,
          numberOfCertificates: 0,
          cost: costoUnitario, // Agregamos el costo unitario
          schedule: this.generatedSchedule.map((entry) => ({
            date: entry.dateKey!,
            start: entry.start,
            end: entry.end,
          })),
        };

        this.apertureCoursesService
          .registerCourseSession(sessionRequest)
          .subscribe({
            next: () => {
              Swal.fire(
                'Éxito',
                'La apertura se ha registrado correctamente.',
                'success'
              ).then(() => {
                this.router.navigate(['/profile/my-courses']); // Redirige a /profile/my-courses
              });
              this.solicitudForm.reset();
              this.generatedSchedule = [];
            },
            error: () => {
              Swal.fire(
                'Error',
                'Hubo un problema al registrar la apertura.',
                'error'
              );
            },
          });

        // Opcional: Reiniciar el formulario y el cronograma
        this.solicitudForm.reset();
        this.generatedSchedule = [];
      }
    });
  }

  // Métodos para obtener mensajes de error
  getCostoUnitarioErrorMessage(): string {
    if (this.solicitudForm.get('costoUnitario')?.hasError('required')) {
      return 'El costo unitario es requerido.';
    }
    if (this.solicitudForm.get('costoUnitario')?.hasError('min')) {
      return 'El costo unitario debe ser mayor o igual a 0.';
    }
    return '';
  }

  getNumParticipantesErrorMessage(): string {
    if (this.solicitudForm.get('numParticipantes')?.hasError('required')) {
      return 'El número de participantes es requerido.';
    }
    if (this.solicitudForm.get('numParticipantes')?.hasError('min')) {
      return 'Debe haber al menos 1 participante.';
    }
    return '';
  }

  /**
   * Genera el periodo del curso basado en las fechas del cronograma.
   *
   * @returns {string} Periodo en formato "Ene 2025 - Mar 2025" o "Ene 2025"
   */
  private generatePeriod(): string {
    if (this.generatedSchedule.length === 0) {
      return 'Periodo desconocido';
    }

    // Obtener fechas de inicio y fin
    const dates = this.generatedSchedule.map(
      (entry) => new Date(entry.dateKey!)
    );
    const startDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const endDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    // Obtener nombres de meses en español
    const monthNames = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    const startMonth = monthNames[startDate.getMonth()];
    const endMonth = monthNames[endDate.getMonth()];
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    // Si el mes y el año son iguales, solo mostramos el mes y año
    if (startMonth === endMonth && startYear === endYear) {
      return `${startMonth} ${startYear}`;
    }

    // Si los años son distintos, incluir el año en ambos meses
    if (startYear !== endYear) {
      return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
    }

    // Caso general: mismo año, pero diferente mes
    return `${startMonth} - ${endMonth} ${startYear}`;
  }
}
