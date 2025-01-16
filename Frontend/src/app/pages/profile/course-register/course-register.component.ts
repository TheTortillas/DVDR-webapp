import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GeneralInformationComponent } from './general-information/general-information.component';
import { UploadDocumentationComponent } from './upload-documentation/upload-documentation.component';
import { CommonModule } from '@angular/common';
import {
  STEPPER_GLOBAL_OPTIONS,
  StepperSelectionEvent,
} from '@angular/cdk/stepper';

// Custom validator function
function actorsValidator() {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value || !Array.isArray(value) || value.length === 0) {
      return { requiredActors: true };
    }
    return null;
  };
}

@Component({
  selector: 'app-course-register',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    GeneralInformationComponent,
    UploadDocumentationComponent,
    CommonModule,
  ],
  templateUrl: './course-register.component.html',
  styleUrl: './course-register.component.scss',
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false, showError: true },
    },
  ],
})
export class CourseRegisterComponent {
  private _formBuilder = inject(FormBuilder);

  firstFormGroup = this._formBuilder.group({
    // Mapeo con los campos de la base de datos
    course_name: ['', [Validators.required, Validators.maxLength(255)]], // nombre-curso
    service_type: ['', Validators.required], // tipo-servicio
    category: ['', Validators.required], // categoria-servicio
    agreement: [''], // convenio
    total_duration: [
      '',
      [Validators.required, Validators.min(20), Validators.max(400)],
    ], // duracion-total
    modality: ['', Validators.required], // modalidad
    educational_offer: ['', Validators.required], // oferta-educativa
    educational_platform: ['', Validators.required], // plataforma-ed
    actors: [[], [actorsValidator()]],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isLinear = false;

  onStepperSelectionChange(event: StepperSelectionEvent) {
    if (event.previouslySelectedIndex === 0 && this.firstFormGroup.invalid) {
      this.firstFormGroup.markAllAsTouched();
    } else if (
      event.previouslySelectedIndex === 1 &&
      this.secondFormGroup.invalid
    ) {
      this.secondFormGroup.markAllAsTouched();
    }
  }

  // Al presionar el segundo botón se imprimen los valores
  onCompleteSecondStep() {
    console.log('Datos del primer FormGroup:', this.firstFormGroup.value);
    console.log('Datos del segundo FormGroup:', this.secondFormGroup.value);
  }
}
