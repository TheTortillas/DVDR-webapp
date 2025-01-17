import { Component, inject, ViewChild } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
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

import { FilesService } from '../../../core/services/files.service';

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
  @ViewChild(UploadDocumentationComponent)
  private uploadDocChild!: UploadDocumentationComponent;

  private _formBuilder = inject(FormBuilder);
  constructor(
    private filesService: FilesService // Inyectamos el servicio
  ) {}

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
    custom_platform: [''], // plataforma-ed-personalizada
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

  getModalityFromCourse(): string {
    const userChoice = this.firstFormGroup.get('modality')?.value;

    // Ajusta la lógica a tus necesidades reales:
    switch (userChoice) {
      case 'Escolarizada':
        return 'schooled';
      case 'No Escolarizada':
        return 'non-schooled';
      case 'Mixta':
        return 'mixed';
      default:
        return ''; // Valor por defecto o manejo de error
    }
  }

  printModality(): void {
    console.log('Modalidad seleccionada:', this.getModalityFromCourse());
  }

  // Al presionar el segundo botón se imprimen los valores
  onCompleteSecondStep() {
    // 1) Obtenemos los archivos subidos desde el hijo
    const uploadedDocs = this.uploadDocChild.getUploadedDocuments();
    console.log('Archivos subidos en el hijo:', uploadedDocs);

    // 2) Si no hay archivos, podemos hacer alguna validación
    if (!uploadedDocs.length) {
      console.warn('No hay documentos subidos');
      return;
    }

    // 3) Armamos el FormData para mandarlos en una sola llamada
    const randomNumber = Math.floor(Math.random() * 10000) + 1;
    // Ej. "0001" en un formato de 4 dígitos
    const folderName = randomNumber.toString().padStart(4, '0');

    const formData = new FormData();
    formData.append('FolderName', folderName);

    // Agregamos cada archivo subido
    uploadedDocs.forEach((doc) => {
      if (doc.uploadedFile) {
        formData.append('Files', doc.uploadedFile, doc.uploadedFile.name);
      }
    });

    // 4) Llamada HTTP a tu servicio (DataService o FilesService) para subir todos
    //    Ajusta el método y endpoint según tu implementación
    this.filesService.uploadCourseDocumentation(formData).subscribe({
      next: (resp) => {
        console.log('Respuesta del servidor:', resp);
        // Manejo de éxito (limpiar, resetear forms, etc.)
      },
      error: (err) => {
        console.error('Error subiendo los documentos:', err);
        // Manejo de error
      },
    });
  }
}
