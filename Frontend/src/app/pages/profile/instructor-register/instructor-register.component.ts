import { Component, inject, ViewChild } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  STEPPER_GLOBAL_OPTIONS,
  StepperSelectionEvent,
} from '@angular/cdk/stepper';
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

  @ViewChild(GeneralInformationInstructorComponent)
  generalInfoCmp!: GeneralInformationInstructorComponent;
  @ViewChild(AcademicBackgroundComponent)
  academicBackgroundCmp!: AcademicBackgroundComponent;
  @ViewChild(WorkExperienceComponent)
  workExperienceCmp!: WorkExperienceComponent;

  hasAcademicRecords = false; // Variable para rastrear el estado de registros académicos
  hasWorkExperience = false; // Para experiencia laboral

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

  logFirstFormGroup() {
    if (this.firstFormGroup.invalid) {
      this.firstFormGroup.markAllAsTouched(); // Marca todos los campos como tocados para mostrar errores
      return;
    }
    console.log(this.firstFormGroup.value);
  }

  validateAcademicRecords(hasRecords: boolean): void {
    this.hasAcademicRecords = hasRecords;
    if (this.hasAcademicRecords) {
      this.secondFormGroup.get('secondCtrl')?.setErrors(null);
    } else {
      this.secondFormGroup.get('secondCtrl')?.setErrors({ required: true });
    }
  }

  validateWorkExperience(hasRecords: boolean): void {
    this.hasWorkExperience = hasRecords;
    if (this.hasWorkExperience) {
      this.thirdFormGroup.get('thirdCtrl')?.setErrors(null);
    } else {
      this.thirdFormGroup.get('thirdCtrl')?.setErrors({ required: true });
    }
  }

  onSubmit() {
    console.log('Información general:', this.firstFormGroup.value);
    console.log('Formación académica:', this.academicBackgroundCmp.dataSource);
    console.log('Experiencia laboral:', this.workExperienceCmp.dataSource);
  }

  onStepperSelectionChange(event: StepperSelectionEvent) {
    if (event.previouslySelectedIndex === 0 && this.firstFormGroup.invalid) {
      this.generalInfoCmp.markAllAsTouched();
    }
  }
}
