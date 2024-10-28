import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
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
  imports: [MatFormField, MatLabel, MatInput, MatNativeDateModule, MatDatepickerModule, FormsModule, ReactiveFormsModule,
    CommonModule, MatButtonModule, RouterLink, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatTableModule,
    MatSelectModule, MatDividerModule, MatIcon],
  templateUrl: './custom-schedule.component.html',
  styleUrl: './custom-schedule.component.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    provideMomentDateAdapter(),
  ],
})
export class CustomScheduleComponent {
  displayedColumns: string[] = ['date', 'start', 'end'];
  dataSource = ELEMENT_DATA;
  addSchedule() {
    // Obtener los valores de los campos de entrada
    const dateInput = (document.getElementById('dp') as HTMLInputElement).value;
    const startHours = (document.getElementById('horaEntradaHoras') as HTMLInputElement).value;
    const startMinutes = (document.getElementById('horaEntradaMinutos') as HTMLInputElement).value;
    const startAmPm = (document.getElementById('horaEntradaAmPm') as HTMLSelectElement).value;
    const endHours = (document.getElementById('horaSalidaHoras') as HTMLInputElement).value;
    const endMinutes = (document.getElementById('horaSalidaMinutos') as HTMLInputElement).value;
    const endAmPm = (document.getElementById('horaSalidaAmPm') as HTMLSelectElement).value;
  
    // Formatear las horas y minutos junto con AM/PM
    const startTime = `${startHours}:${startMinutes} ${startAmPm}`;
    const endTime = `${endHours}:${endMinutes} ${endAmPm}`;
  
    // Crear un nuevo objeto customSchedule
    const newSchedule: customSchedule = {
      date: dateInput,
      start: startTime,
      end: endTime
    };
  
    // Añadir el nuevo objeto al dataSource existente
    this.dataSource = [...this.dataSource, newSchedule];
  }

}