// aperture-info.component.ts
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
import Swal from 'sweetalert2';

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

  displayedColumns: string[] = ['dateDisplay', 'start', 'end'];

  generatedSchedule: ScheduleEntry[] = [];

  // Definir el FormGroup para las validaciones
  solicitudForm: FormGroup;

  constructor(private route: ActivatedRoute, private fb: FormBuilder) {
    this.route.queryParams.subscribe((params) => {
      this.title = params['title'] || '';
      this.clave = params['clave'] || '';
    });

    // Inicializar el formulario con validaciones
    this.solicitudForm = this.fb.group({
      costoUnitario: ['', [Validators.required, Validators.min(0)]],
      numParticipantes: ['', [Validators.required, Validators.min(1)]],
    });
  }

  openDialog(
    enterAnimationDuration: string,
    exitAnimationDuration: string
  ): void {
    const dialogRef = this.dialog.open(ScheduleDialogComponent, {
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
        // Aquí puedes agregar la lógica para enviar los datos al backend
        // Por ahora, mostraremos una alerta de éxito

        // Obtener los valores del formulario
        const costoUnitario = this.solicitudForm.value.costoUnitario;
        const numParticipantes = this.solicitudForm.value.numParticipantes;
        const costoTotal = costoUnitario * numParticipantes;

        // Imprimir en consola
        console.log('Número de participantes:', numParticipantes);
        console.log('Costo unitario:', costoUnitario);
        console.log('Costo total:', costoTotal);
        console.log('Cronograma generado:', this.generatedSchedule);
        Swal.fire({
          title: 'Solicitud Enviada',
          text: 'Su solicitud de apertura de curso ha sido enviada exitosamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
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
}
