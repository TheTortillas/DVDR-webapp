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

import { ViewChild } from '@angular/core';

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

  onTabChange(event: any) {
    this.activeTab = event.tab.textLabel;
  }

  generateSchedule() {
    if (this.activeTab === 'Fechas periódicas') {
      const dateRange =
        this.periodicScheduleComponent.form.get('dateRange')?.value;
      const totalHours =
        this.periodicScheduleComponent.form.get('totalHours')?.value;
      const startTime = this.periodicScheduleComponent.getFormattedTime(
        this.periodicScheduleComponent.form.get('startTime') as FormGroup
      );
      const endTime = this.periodicScheduleComponent.getFormattedTime(
        this.periodicScheduleComponent.form.get('endTime') as FormGroup
      );
      const selectedDays = this.periodicScheduleComponent.getSelectedDays();

      const formattedStart = this.periodicScheduleComponent.getFormattedDate(
        dateRange.start
      );
      const formattedEnd = this.periodicScheduleComponent.getFormattedDate(
        dateRange.end
      );

      if (
        !dateRange.start ||
        !dateRange.end ||
        !totalHours ||
        selectedDays.length === 0
      ) {
        Swal.fire({
          title: 'Advertencia',
          text: 'Por favor, completa todos los campos y selecciona al menos un día.',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
        });
        return;
      }

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

      const hoursDifference =
        end24.hours +
        end24.minutes / 60 -
        (start24.hours + start24.minutes / 60);

      // Convierte las horas y minutos a minutos
      const startInMinutes = start24.hours * 60 + start24.minutes;
      const endInMinutes = end24.hours * 60 + end24.minutes;

      // Calcula la diferencia en minutos
      const minutesDifference = endInMinutes - startInMinutes;

      console.log('Fecha de inicio:', formattedStart);
      console.log('Fecha final:', formattedEnd);
      console.log('Horas totales:', totalHours);
      console.log('Hora de inicio:', startTime);
      console.log('Hora de fin:', endTime);
      console.log('Días seleccionados:', selectedDays);
      console.log('Diferencia en horas:', hoursDifference);
      console.log('Diferencia en minutos:', minutesDifference);

      Swal.fire({
        title: 'Generar cronograma',
        text: `Estás en el tab: ${this.activeTab}`,
        icon: 'info',
        confirmButtonText: 'Aceptar',
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
        title: 'El cronograma es correcto, ¿confirmas este cronograma?',
        html: buildScheduleTable(schedule),
        icon: 'info',
        showDenyButton: true,
        confirmButtonText: 'Generar cronograma',
        denyButtonText: 'No, seguir editando',
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
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
