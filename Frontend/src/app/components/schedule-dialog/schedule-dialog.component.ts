import {ChangeDetectionStrategy, Component} from '@angular/core';
import { MatNativeDateModule} from '@angular/material/core';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormBuilder} from '@angular/forms';
import {provideNativeDateAdapter} from '@angular/material/core';
import {provideMomentDateAdapter} from '@angular/material-moment-adapter'; //ng add @angular/material-moment-adapter
import {DateAdapter, MAT_DATE_LOCALE} from '@angular/material/core';
import {MatDatepickerIntl, MatDatepickerModule} from '@angular/material/datepicker';
import {MatTabsModule} from '@angular/material/tabs';

import 'moment/locale/es';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PeriodicScheduleComponent } from "./periodic-schedule/periodic-schedule.component";


@Component({
  selector: 'app-schedule-dialog',
  standalone: true,
  imports: [MatNativeDateModule, MatDatepickerModule, MatFormFieldModule, MatInputModule,
    FormsModule, ReactiveFormsModule, CommonModule, MatButtonModule, MatDialogModule, RouterLink,
    MatDialogModule, MatDialogContent, MatDialogActions, MatDialogTitle, MatDialogClose, MatTabsModule,
    MatCheckboxModule, PeriodicScheduleComponent],
  templateUrl: './schedule-dialog.component.html',
  styleUrl: './schedule-dialog.component.scss',
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'es-ES'},
    provideMomentDateAdapter(),
  ],
})
export class ScheduleDialogComponent {

}
