import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { GeneralInformationInstructorComponent } from './general-information-instructor/general-information-instructor.component';
import { AcademicBackgroundComponent } from './academic-background/academic-background.component';
import { WorkExperienceComponent } from './work-experience/work-experience.component';

@Component({
  selector: 'app-instructor-register',
  standalone: true,
  imports: [
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    GeneralInformationInstructorComponent,
    AcademicBackgroundComponent,
    WorkExperienceComponent,
  ],
  templateUrl: './instructor-register.component.html',
  styleUrl: './instructor-register.component.scss',
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false, showError: true },
    },
  ],
  host: { ngSkipHydration: '' }, // Añade esta línea para desactivar la hidratación
})
export class InstructorRegisterComponent {
  private _formBuilder = inject(FormBuilder);

  firstFormGroup = this._formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    secondLastName: ['', Validators.required],
    street: ['', Validators.required],
    number: ['', Validators.required],
    colony: ['', Validators.required],
    postalCode: ['', [Validators.required, Validators.maxLength(5)]],
    city: ['', Validators.required],
    state: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    mobile: ['', Validators.required],
    expertiseAreas: ['', Validators.required],
  });

  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  thirdFormGroup = this._formBuilder.group({
    thirdCtrl: ['', Validators.required],
  });
}
