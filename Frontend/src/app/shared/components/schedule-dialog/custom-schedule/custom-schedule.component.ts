import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MatFormField,
  MatFormFieldModule,
  MatLabel,
} from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import moment from 'moment';
import Swal from 'sweetalert2';

export interface customSchedule {
  dateKey: string;
  date: string;
  start: string;
  end: string;
}

const ELEMENT_DATA: customSchedule[] = [];

@Component({
  selector: 'app-custom-schedule',
  standalone: true,
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatNativeDateModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSelectModule,
    MatDividerModule,
    MatIcon,
  ],
  templateUrl: './custom-schedule.component.html',
  styleUrl: './custom-schedule.component.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    provideMomentDateAdapter(),
  ],
})
export class CustomScheduleComponent implements OnInit {
  @Input() totalDuration: number = 0;
  @Input() enableDateFilter: boolean = true;

  displayedColumns: string[] = ['date', 'start', 'end', 'actions'];
  dataSource = ELEMENT_DATA;

  form: FormGroup;
  totalHoursForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      date: [null, Validators.required],
      startTime: this.fb.group({
        hours: [
          null,
          [Validators.required, Validators.min(1), Validators.max(12)],
        ],
        minutes: [
          null,
          [Validators.required, Validators.min(0), Validators.max(59)],
        ],
        period: [null, Validators.required],
      }),
      endTime: this.fb.group({
        hours: [
          null,
          [Validators.required, Validators.min(1), Validators.max(12)],
        ],
        minutes: [
          null,
          [Validators.required, Validators.min(0), Validators.max(59)],
        ],
        period: [null, Validators.required],
      }),
    });

    this.totalHoursForm = this.fb.group({
      totalHours: [0],
    });
  }

  ngOnInit() {
    this.totalHoursForm.patchValue({
      totalHours: this.totalDuration,
    });
  }

  getFormattedTime(timeGroup: FormGroup): string {
    const hours = timeGroup.get('hours')?.value;
    const minutes = timeGroup.get('minutes')?.value;
    const period = timeGroup.get('period')?.value;
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${period}`;
  }

  getFormattedDate(date: Date): string {
    return moment(date).format('ddd DD/MM/YYYY');
  }

  convertTo24HourFormat(timeGroup: FormGroup): {
    hours: number;
    minutes: number;
  } {
    let hours = timeGroup.get('hours')?.value;
    const minutes = timeGroup.get('minutes')?.value;
    const period = timeGroup.get('period')?.value;

    if (period === 'PM' && hours < 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return { hours, minutes };
  }

  addSchedule() {
    if (this.form.invalid) {
      return;
    }

    const start24 = this.convertTo24HourFormat(
      this.form.get('startTime') as FormGroup
    );
    const end24 = this.convertTo24HourFormat(
      this.form.get('endTime') as FormGroup
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

    const dateInput = this.form.get('date')?.value;
    const dateKey = moment(dateInput).format('YYYY-MM-DD');
    const displayDate = moment(dateInput).format('ddd DD/MM/YYYY');

    const startTime = this.getFormattedTime(
      this.form.get('startTime') as FormGroup
    );
    const endTime = this.getFormattedTime(
      this.form.get('endTime') as FormGroup
    );

    const newSchedule: customSchedule = {
      dateKey: dateKey,
      date: displayDate,
      start: startTime,
      end: endTime,
    };

    // Busca fecha repetida y la reemplaza si existe
    const idx = this.dataSource.findIndex((item) => item.dateKey === dateKey);
    if (idx !== -1) {
      this.dataSource[idx] = newSchedule;
    } else {
      this.dataSource.push(newSchedule);
    }

    // Ordenar por dateKey (YYYY-MM-DD) de manera ascendente
    this.dataSource.sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    // Reemplazar referencia para forzar la detección de cambios en la tabla
    this.dataSource = [...this.dataSource];

    this.form.reset();
  }

  removeSchedule(index: number) {
    this.dataSource = this.dataSource.filter((_, i) => i !== index);
  }

  myFilter = (d: Date | null): boolean => {
    if (!this.enableDateFilter) return true;

    const today = new Date();
    const minDate = new Date();
    minDate.setDate(today.getDate() + 5); // Añade 5 días a la fecha actual
    minDate.setHours(0, 0, 0, 0);

    return d ? d >= minDate : false;
  };
}
