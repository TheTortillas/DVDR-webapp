import { Component } from '@angular/core';
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

export interface customSchedule {
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
export class CustomScheduleComponent {
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
        period: ['AM', Validators.required],
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
        period: ['AM', Validators.required],
      }),
    });

    this.totalHoursForm = this.fb.group({
      totalHours: [null, Validators.required],
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

  addSchedule() {
    if (this.form.invalid) {
      return;
    }

    const dateInput = this.form.get('date')?.value;
    const formattedDate = this.getFormattedDate(dateInput);
    const startTime = this.getFormattedTime(
      this.form.get('startTime') as FormGroup
    );
    const endTime = this.getFormattedTime(
      this.form.get('endTime') as FormGroup
    );

    const newSchedule: customSchedule = {
      date: formattedDate,
      start: startTime,
      end: endTime,
    };

    this.dataSource = [...this.dataSource, newSchedule];
    this.form.reset();
  }

  removeSchedule(index: number) {
    this.dataSource = this.dataSource.filter((_, i) => i !== index);
  }
}
