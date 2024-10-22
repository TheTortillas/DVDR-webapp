import { Component } from '@angular/core';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import {MatNativeDateModule, provideNativeDateAdapter} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {provideMomentDateAdapter} from '@angular/material-moment-adapter'; //ng add @angular/material-moment-adapter
import {DateAdapter, MAT_DATE_LOCALE} from '@angular/material/core';
import {MatDatepickerIntl } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';


export interface customSchedule {
  date: string;
  start: string;
  end: string;
}

const ELEMENT_DATA: customSchedule[] = [
  { date: '01/12/2025', start: '11:00 a.m.', end: '01:00 p.m.' },
  // Agrega más datos según sea necesario
];

@Component({
  selector: 'app-custom-schedule',
  standalone: true,
  imports: [ MatFormField, MatLabel, MatInput, MatNativeDateModule, MatDatepickerModule, FormsModule, ReactiveFormsModule, 
    CommonModule, MatButtonModule, RouterLink, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatTableModule],
  templateUrl: './custom-schedule.component.html',
  styleUrl: './custom-schedule.component.scss',
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'es-ES'},
    provideMomentDateAdapter(),
  ],
})
export class CustomScheduleComponent {
  displayedColumns: string[] = ['date', 'start', 'end'];
  dataSource = ELEMENT_DATA;
}
