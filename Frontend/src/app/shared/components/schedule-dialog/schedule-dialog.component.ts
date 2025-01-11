import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import {
  FormGroup,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter'; //ng add @angular/material-moment-adapter
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import {
  MatDatepickerIntl,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import moment from 'moment';

import { ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import 'moment/locale/es';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PeriodicScheduleComponent } from './periodic-schedule/periodic-schedule.component';
import { CustomScheduleComponent } from './custom-schedule/custom-schedule.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-schedule-dialog',
  standalone: true,
  imports: [
    MatNativeDateModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatDialogModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogTitle,
    MatDialogClose,
    MatTabsModule,
    MatTabGroup,
    MatCheckboxModule,
    PeriodicScheduleComponent,
    CustomScheduleComponent,
    MatTooltipModule,
    MatIcon,
  ],
  templateUrl: './schedule-dialog.component.html',
  styleUrl: './schedule-dialog.component.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    provideMomentDateAdapter(),
  ],
})
export class ScheduleDialogComponent {
  @ViewChild(PeriodicScheduleComponent)
  periodicScheduleComponent!: PeriodicScheduleComponent;

  @ViewChild(CustomScheduleComponent)
  customScheduleComponent!: CustomScheduleComponent;

  activeTab: string = 'Fechas periódicas';

  constructor(private dialogRef: MatDialogRef<ScheduleDialogComponent>) {}

  onTabChange(event: any) {
    this.activeTab = event.tab.textLabel;
  }

  generateSchedule() {
    if (this.activeTab === 'Fechas periódicas') {
      const dateRange =
        this.periodicScheduleComponent.form.get('dateRange')?.value;
      const totalHours =
        this.periodicScheduleComponent.form.get('totalHours')?.value;
      const selectedDays = this.periodicScheduleComponent.getSelectedDays();

      if (
        !dateRange?.start ||
        !dateRange?.end ||
        !selectedDays.length ||
        !totalHours
      ) {
        Swal.fire({
          title: 'Advertencia',
          text: 'Por favor, completa todos los campos y selecciona al menos un día.',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
        });
        return;
      }

      // Obtener horas inicio/fin en formato 12h y 24h
      const startTimeStr = this.periodicScheduleComponent.getFormattedTime(
        this.periodicScheduleComponent.form.get('startTime') as FormGroup
      );
      const endTimeStr = this.periodicScheduleComponent.getFormattedTime(
        this.periodicScheduleComponent.form.get('endTime') as FormGroup
      );
      const start24 = this.periodicScheduleComponent.convertTo24HourFormat(
        this.periodicScheduleComponent.form.get('startTime') as FormGroup
      );
      const end24 = this.periodicScheduleComponent.convertTo24HourFormat(
        this.periodicScheduleComponent.form.get('endTime') as FormGroup
      );

      if (
        start24.hours > end24.hours ||
        (start24.hours === end24.hours && start24.minutes >= end24.minutes)
      ) {
        Swal.fire({
          title: 'Error',
          text: 'La hora de inicio debe ser menor que la hora de fin.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        return;
      }

      // Mapa de días y generación de fechas
      const dayMap: { [key: string]: number } = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 7,
      };

      const startDate = moment(dateRange.start).startOf('day');
      const endDate = moment(dateRange.end).startOf('day');

      const periodicScheduleArray: Array<{
        dateKey: string;
        dateDisplay: string;
        start: string;
        end: string;
      }> = [];

      const cursor = moment(startDate);
      while (cursor.isSameOrBefore(endDate, 'day')) {
        const currentDayISO = cursor.isoWeekday();
        if (selectedDays.some((day) => dayMap[day] === currentDayISO)) {
          periodicScheduleArray.push({
            dateKey: cursor.format('YYYY-MM-DD'),
            dateDisplay: cursor.format('ddd DD/MM/YYYY'),
            start: startTimeStr,
            end: endTimeStr,
          });
        }
        cursor.add(1, 'day');
      }

      // Función para convertir de "HH:MM AM/PM" a minutos
      const parseTimeToMinutes = (timeString: string): number => {
        const [time, period] = timeString.split(' ');
        const [rawHours, rawMinutes] = time.split(':');
        let hours = parseInt(rawHours, 10);
        const minutes = parseInt(rawMinutes, 10);

        if (period === 'PM' && hours < 12) {
          hours += 12;
        } else if (period === 'AM' && hours === 12) {
          hours = 0;
        }
        return hours * 60 + minutes;
      };

      // Suma total de minutos en las filas
      const scheduleTotalMinutes = periodicScheduleArray.reduce((acc, row) => {
        const startMins = parseTimeToMinutes(row.start);
        const endMins = parseTimeToMinutes(row.end);
        return acc + (endMins - startMins);
      }, 0);

      // Comparar con horas totales (en minutos)
      if (scheduleTotalMinutes !== totalHours * 60) {
        Swal.fire({
          title: 'Advertencia',
          text: 'La suma de horas de los días generados no coincide con las horas totales del curso.',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
        });
        return;
      }

      // Construir tabla HTML
      const buildScheduleTable = (
        data: { dateDisplay: string; start: string; end: string }[]
      ): string => {
        let tableRows = '';
        data.forEach((item) => {
          tableRows += `
            <tr>
              <td style="border:1px solid #ccc;padding:5px;">${item.dateDisplay}</td>
              <td style="border:1px solid #ccc;padding:5px;">${item.start}</td>
              <td style="border:1px solid #ccc;padding:5px;">${item.end}</td>
            </tr>
          `;
        });
        return `
          <table style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr>
                <th style="border:1px solid #ccc;padding:5px;">Fecha</th>
                <th style="border:1px solid #ccc;padding:5px;">Hora Inicio</th>
                <th style="border:1px solid #ccc;padding:5px;">Hora Fin</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        `;
      };

      // Mostrar SweetAlert con tabla
      Swal.fire({
        title:
          'El cronograma es valido, ¿confirmas estas fechas para la apertura del curso?',
        html: buildScheduleTable(periodicScheduleArray),
        icon: 'info',
        showDenyButton: true,
        confirmButtonText: 'Generar cronograma',
        denyButtonText: 'No, seguir editando',
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.dialogRef.close(periodicScheduleArray);
          Swal.fire({
            title: 'Cronograma generado',
            text: 'Se ha confirmado el cronograma.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
          });
        }
      });
    } else if (this.activeTab === 'Fechas personalizadas') {
      const totalHours =
        this.customScheduleComponent.totalHoursForm.get('totalHours')?.value;
      const schedule = this.customScheduleComponent.dataSource;

      if (!totalHours || schedule.length === 0) {
        Swal.fire({
          title: 'Advertencia',
          text: 'Por favor, ingresa las horas totales del curso y llena la tabla.',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
        });
        return;
      }

      // Convertir "HH:MM AM/PM" a minutos
      const parseTimeToMinutes = (timeString: string): number => {
        const [time, period] = timeString.split(' ');
        const [rawHours, rawMinutes] = time.split(':');
        let hours = parseInt(rawHours, 10);
        const minutes = parseInt(rawMinutes, 10);

        if (period === 'PM' && hours < 12) {
          hours += 12;
        } else if (period === 'AM' && hours === 12) {
          hours = 0;
        }
        return hours * 60 + minutes;
      };

      // Sumar minutos de todas las filas
      const scheduleTotalMinutes = schedule.reduce((acc, row) => {
        const startInMinutes = parseTimeToMinutes(row.start);
        const endInMinutes = parseTimeToMinutes(row.end);
        return acc + (endInMinutes - startInMinutes);
      }, 0);

      // Comparar con totalHours (pasado a minutos)
      if (scheduleTotalMinutes !== totalHours * 60) {
        Swal.fire({
          title: 'Advertencia',
          text: 'La suma de horas de los días añadidos no coincide con las horas totales del curso.',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
        });
        return;
      }

      // Construir tabla HTML
      const buildScheduleTable = (
        data: { date: string; start: string; end: string }[]
      ): string => {
        let tableRows = '';
        data.forEach((item) => {
          tableRows += `
            <tr>
              <td style="border:1px solid #ccc;padding:5px;">${item.date}</td>
              <td style="border:1px solid #ccc;padding:5px;">${item.start}</td>
              <td style="border:1px solid #ccc;padding:5px;">${item.end}</td>
            </tr>
          `;
        });
        return `
          <table style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr>
                <th style="border:1px solid #ccc;padding:5px;">Fecha</th>
                <th style="border:1px solid #ccc;padding:5px;">Hora Inicio</th>
                <th style="border:1px solid #ccc;padding:5px;">Hora Fin</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        `;
      };

      console.log('Horas totales:', totalHours);
      console.log('Horario personalizado:', schedule);
      console.log('Suma en minutos de las filas:', scheduleTotalMinutes);

      Swal.fire({
        title:
          'El cronograma es valido, ¿confirmas estas fechas para la apertura del curso?',
        html: buildScheduleTable(schedule),
        icon: 'info',
        showDenyButton: true,
        confirmButtonText: 'Generar cronograma',
        denyButtonText: 'No, seguir editando',
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.dialogRef.close(schedule);
          Swal.fire({
            title: 'Cronograma generado',
            text: 'Se ha confirmado el cronograma.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
          });
        }
        //  else if (result.isDenied) {
        //   Swal.fire({
        //     title: 'Edición del cronograma',
        //     text: 'Puedes realizar los cambios necesarios.',
        //     icon: 'info',
        //     confirmButtonText: 'Aceptar',
        //   });
        // }
      });
    }
  }
}
