import { Component, ViewEncapsulation } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTabGroup } from '@angular/material/tabs';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatDatepicker, MatDateRangeInput } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ChangeDetectionStrategy } from '@angular/core';
import { MAT_DATE_FORMATS, MatNativeDateModule } from '@angular/material/core';
import {
  FormGroup,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  MatChipEditedEvent,
  MatChipInputEvent,
  MatChipsModule,
} from '@angular/material/chips';

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
import { MatTabsModule } from '@angular/material/tabs';
import { default as _rollupMoment, Moment } from 'moment';
import * as _moment from 'moment';
import 'moment/locale/es';

const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-work-experience-dialog',
  standalone: true,
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatDialogContent,
    MatDialogModule,
    MatDialogActions,
    MatDialogTitle,
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
    MatTabsModule,
    MatCheckboxModule,
    MatIcon,
    MatChipsModule,
  ],
  templateUrl: './work-experience-dialog.component.html',
  styleUrl: './work-experience-dialog.component.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },

    provideMomentDateAdapter(MY_FORMATS),
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkExperienceDialogComponent {
  experienceForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<WorkExperienceDialogComponent>
  ) {
    // Ajusta este formulario según los campos que requieras
    this.experienceForm = this.fb.group({
      periodo: ['', Validators.required],
      organizacion: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      puesto: ['', Validators.required],
      actividad: ['', Validators.required],
      evidencia: [''], // Aquí podrías almacenar el nombre o path del archivo
    });
  }

  readonly startDate = new FormControl();
  readonly endDate = new FormControl();

  setMonthAndYear(
    normalizedMonthAndYear: moment.Moment,
    datepicker: MatDatepicker<moment.Moment>,
    control: FormControl
  ) {
    const ctrlValue = control.value ?? moment();
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    control.setValue(ctrlValue);
    datepicker.close();
  }

  InputChange(fileInputEvent: any) {
    console.log(fileInputEvent.target.files[0]);
  }

  // Lista para almacenar los archivos seleccionados
  selectedFiles: File[] = [];

  // Método que se ejecuta cuando el input cambia (cuando el usuario selecciona un archivo)
  onInputChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Reemplaza el archivo anterior con el nuevo archivo seleccionado
      this.selectedFiles = [file];
      // Genera una URL temporal para el archivo seleccionado
      const fileUrl = URL.createObjectURL(file);
      // Agrega el nombre del archivo y la URL al formulario
      this.experienceForm.patchValue({ evidencia: fileUrl });
    }
  }

  addExperience() {
    const { fechaInicio, fechaFin } = this.experienceForm.value;

    // Convertir a objetos de Moment.js si no lo son
    const inicio = moment(fechaInicio);
    const fin = moment(fechaFin);

    // Valida si las fechas se pudieron convertir correctamente
    if (!fechaInicio.isValid() || !fechaFin.isValid()) {
      console.error('Fechas no válidas: ', fechaInicio, fechaFin);
      return;
    }

    // Formatea las fechas y establece el período
    const periodo = `${inicio.format('MM/YYYY')} - ${fin.format('MM/YYYY')}`;
    this.experienceForm.patchValue({ periodo: periodo });

    if (this.experienceForm.valid) {
      // Envía la información al componente que abrió el diálogo
      const formData = new FormData();
      if (this.selectedFiles.length > 0) {
        formData.append('file', this.selectedFiles[0]);
      }

      this.dialogRef.close(this.experienceForm.value);
      console.log(this.experienceForm.value);
    }
  }

  // Método para eliminar un archivo de la lista
  removeFile(file: File) {
    // Vacía la lista de archivos seleccionados
    this.selectedFiles = [];
    // Limpia el campo de evidencia en el formulario
    this.experienceForm.patchValue({ evidencia: '' });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onDateChange(event: any, controlName: string) {
    const date: Moment = event.value;
    this.experienceForm.get(controlName)?.setValue(date);
  }
}
