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
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-periodic-schedule',
  standalone: true,
  imports: [MatNativeDateModule, MatDatepickerModule, FormsModule,ReactiveFormsModule, 
    CommonModule, MatButtonModule, RouterLink, MatCheckboxModule, MatFormFieldModule, MatInputModule],
  templateUrl: './periodic-schedule.component.html',
  styleUrl: './periodic-schedule.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class PeriodicScheduleComponent {

}
