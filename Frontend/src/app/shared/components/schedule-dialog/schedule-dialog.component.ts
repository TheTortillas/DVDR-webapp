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

      if (
        !dateRange.start ||
        !dateRange.end ||
        !totalHours ||
        selectedDays.length === 0
      ) {
        Swal.fire({
          title: 'Error',
          text: 'Por favor, completa todos los campos y selecciona al menos un día.',
          icon: 'error',
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

      console.log('Fecha de inicio:', dateRange.start);
      console.log('Fecha final:', dateRange.end);
      console.log('Horas totales:', totalHours);
      console.log('Hora de inicio:', startTime);
      console.log('Hora de fin:', endTime);
      console.log('Días seleccionados:', selectedDays);
      console.log('Diferencia en horas:', hoursDifference);

      Swal.fire({
        title: 'Generar cronograma',
        text: `Estás en el tab: ${this.activeTab}`,
        icon: 'info',
        confirmButtonText: 'Aceptar',
      });
    }
  }
}
