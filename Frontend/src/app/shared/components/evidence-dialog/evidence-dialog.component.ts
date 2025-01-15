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
import {
  ErrorStateMatcher,
  MAT_DATE_FORMATS,
  MatNativeDateModule,
} from '@angular/material/core';
import {
  FormGroup,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  FormGroupDirective,
  NgForm,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
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

import Swal from 'sweetalert2';

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

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-evidence-dialog',
  standalone: true,
  imports: [
    MatFormField,
    MatSelectModule,
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
  templateUrl: './evidence-dialog.component.html',
  styleUrl: './evidence-dialog.component.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },

    provideMomentDateAdapter(MY_FORMATS),
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvidenceDialogComponent {
  // readonly date = new FormControl(moment());
  evidenceForm: FormGroup;

  matcher = new MyErrorStateMatcher();
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EvidenceDialogComponent>
  ) {
    // Ajusta este formulario según los campos que requieras
    this.evidenceForm = this.fb.group({
      nivelAcademico: ['', Validators.required],
      tituloOtorgado: ['', Validators.required],
      institucion: ['', Validators.required],
      anioInicio: [null, Validators.required],
      anioFin: [null, Validators.required],
      periodo: ['', Validators.required],
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
      this.evidenceForm.patchValue({ evidencia: fileUrl });
    }
  }

  // Llamado al hacer clic en "Añadir evidencia"
  addEvidence() {
    const { anioInicio, anioFin } = this.evidenceForm.value;
    this.evidenceForm.patchValue({ periodo: `${anioInicio} - ${anioFin}` });

    if (this.evidenceForm.invalid) {
      this.evidenceForm.markAllAsTouched(); // Marca todos los campos como tocados para mostrar errores
      return;
    }

    if (this.selectedFiles.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Debes adjuntar un archivo.',
      });
      return;
    }

    if (this.evidenceForm.valid) {
      const formData = new FormData();
      formData.append('file', this.selectedFiles[0]);

      this.dialogRef.close(this.evidenceForm.value);
      console.log(this.evidenceForm.value);
    }
  }

  // Método para eliminar un archivo de la lista
  removeFile(file: File) {
    // Vacía la lista de archivos seleccionados
    this.selectedFiles = [];
    // Limpia el campo de evidencia en el formulario
    this.evidenceForm.patchValue({ evidencia: '' });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
