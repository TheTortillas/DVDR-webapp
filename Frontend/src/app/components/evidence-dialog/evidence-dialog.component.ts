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
  MatDialogRef
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatDatepicker, MatDateRangeInput } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {ChangeDetectionStrategy} from '@angular/core';
import { MAT_DATE_FORMATS, MatNativeDateModule} from '@angular/material/core';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {MatChipEditedEvent, MatChipInputEvent, MatChipsModule} from '@angular/material/chips';


import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormBuilder} from '@angular/forms';
import {provideNativeDateAdapter} from '@angular/material/core';
import {provideMomentDateAdapter} from '@angular/material-moment-adapter'; //ng add @angular/material-moment-adapter
import {DateAdapter, MAT_DATE_LOCALE} from '@angular/material/core';
import {MatDatepickerIntl, MatDatepickerModule} from '@angular/material/datepicker';
import {MatTabsModule} from '@angular/material/tabs';
import {default as _rollupMoment, Moment} from 'moment';
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
  selector: 'app-evidence-dialog',
  standalone: true,
  imports: [MatFormField, MatLabel, MatInput, MatButton, MatDialogContent,
     MatTabGroup, MatDialogModule, MatDialogActions, MatDialogTitle, MatDialogClose,
    MatNativeDateModule, MatDatepickerModule, MatFormFieldModule, MatInputModule,
    FormsModule, ReactiveFormsModule, CommonModule, MatButtonModule, MatDialogModule, RouterLink,
    MatDialogModule, MatDialogContent, MatDialogActions, MatDialogTitle, MatDialogClose, MatTabsModule,
    MatCheckboxModule, MatIcon, MatChipsModule],
  templateUrl: './evidence-dialog.component.html',
  styleUrl: './evidence-dialog.component.scss',
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'es-ES'},
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    
    provideMomentDateAdapter(MY_FORMATS),
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvidenceDialogComponent {
  // readonly date = new FormControl(moment());

  readonly startDate = new FormControl();
  readonly endDate = new FormControl();

  setMonthAndYear(normalizedMonthAndYear: moment.Moment, datepicker: MatDatepicker<moment.Moment>, control: FormControl) {
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
    const file = event.target.files[0];  // Captura el archivo seleccionado (solo uno porque es un input único)
    if (file) {
      this.selectedFiles.push(file);  // Agrega el archivo a la lista de seleccionados
    }
  }

  // Método para eliminar un archivo de la lista
  removeFile(file: File) {
    const index = this.selectedFiles.indexOf(file);
    if (index >= 0) {
      this.selectedFiles.splice(index, 1);  // Remueve el archivo de la lista
    }
  }
}
