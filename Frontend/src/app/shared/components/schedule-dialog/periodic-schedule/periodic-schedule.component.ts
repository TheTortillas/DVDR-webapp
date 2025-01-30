import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import {
  FormGroup,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import moment from 'moment';

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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-periodic-schedule',
  standalone: true,
  imports: [
    MatNativeDateModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './periodic-schedule.component.html',
  styleUrl: './periodic-schedule.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class PeriodicScheduleComponent implements OnInit {
  @Input() totalDuration: number = 0;
  form: FormGroup;

  daysOfWeek = [
    { name: 'Lunes', value: 'monday' },
    { name: 'Martes', value: 'tuesday' },
    { name: 'Miércoles', value: 'wednesday' },
    { name: 'Jueves', value: 'thursday' },
    { name: 'Viernes', value: 'friday' },
    { name: 'Sábado', value: 'saturday' },
    { name: 'Domingo', value: 'sunday' },
  ];

  constructor() {
    this.form = new FormGroup({
      dateRange: new FormGroup({
        start: new FormControl(null, Validators.required),
        end: new FormControl(null, Validators.required),
      }),
      totalHours: new FormControl(0),
      startTime: new FormGroup({
        hours: new FormControl(null, [
          Validators.required,
          Validators.min(1),
          Validators.max(12),
        ]),
        minutes: new FormControl(null, [
          Validators.required,
          Validators.min(0),
          Validators.max(59),
        ]),
        period: new FormControl(null, Validators.required),
      }),
      endTime: new FormGroup({
        hours: new FormControl(null, [
          Validators.required,
          Validators.min(1),
          Validators.max(12),
        ]),
        minutes: new FormControl(null, [
          Validators.required,
          Validators.min(0),
          Validators.max(59),
        ]),
        period: new FormControl(null, Validators.required),
      }),
      daysOfWeek: new FormGroup({
        monday: new FormControl(false),
        tuesday: new FormControl(false),
        wednesday: new FormControl(false),
        thursday: new FormControl(false),
        friday: new FormControl(false),
        saturday: new FormControl(false),
        sunday: new FormControl(false),
      }),
    });
  }

  ngOnInit() {
    this.form.patchValue({
      totalHours: this.totalDuration,
    });
  }

  getFormattedTime(timeGroup: FormGroup): string {
    const hours = timeGroup.get('hours')?.value;
    const minutes = timeGroup.get('minutes')?.value;
    const period = timeGroup.get('period')?.value;
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${period}`;
  }

  getSelectedDays(): string[] {
    const daysGroup = this.form.get('daysOfWeek') as FormGroup;
    return Object.keys(daysGroup.controls).filter(
      (day) => daysGroup.get(day)?.value
    );
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

  getFormattedDate(date: Date): string {
    return moment(date).format('ddd DD/MM/YYYY');
  }

  myFilter(d: Date | null): boolean {
    if (!d) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d.getTime() >= today.getTime();
  }
}
