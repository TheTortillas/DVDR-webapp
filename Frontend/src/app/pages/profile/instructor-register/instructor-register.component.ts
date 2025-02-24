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
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { GeneralInformationInstructorComponent } from './general-information-instructor/general-information-instructor.component';
import { AcademicBackgroundComponent } from './academic-background/academic-background.component';
import { WorkExperienceComponent } from './work-experience/work-experience.component';
import { InstructorRegisterService } from '../../../core/services/instructor-register.service';
import Swal from 'sweetalert2';
import { StorageService } from '../../../core/services/storage.service';

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

  constructor(
    private instructorRegisterService: InstructorRegisterService,
    private storageService: StorageService,
    private router: Router
  ) {}

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
    phone: [''],
    mobile: ['', Validators.required],
    expertiseAreas: ['', Validators.required],
    center: [''],
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
    if (
      this.firstFormGroup.invalid ||
      !this.hasAcademicRecords ||
      !this.hasWorkExperience
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, completa todos los campos requeridos.',
      });
      return;
    }

    const token = this.storageService.getItem('token');
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se encontró información de sesión.',
      });
      return;
    }

    const claims = this.storageService.getTokenClaims(token);
    if (!claims) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener la información del usuario.',
      });
      return;
    }

    const formData = new FormData();

    // Generar carpeta aleatoria
    const folderName = Math.random().toString(36).substring(2, 15); // Nombre aleatorio
    formData.append('FolderName', folderName);

    // Agregar información general
    const generalInfo = {
      ...this.firstFormGroup.value,
      center: claims.center, // Use center from claims instead of localStorage
    };

    formData.append('GeneralInfo.FirstName', generalInfo.firstName || '');
    formData.append('GeneralInfo.LastName', generalInfo.lastName || '');
    formData.append(
      'GeneralInfo.SecondLastName',
      generalInfo.secondLastName || ''
    );
    formData.append('GeneralInfo.Street', generalInfo.street || '');
    formData.append('GeneralInfo.Number', generalInfo.number || '');
    formData.append('GeneralInfo.Colony', generalInfo.colony || '');
    formData.append('GeneralInfo.PostalCode', generalInfo.postalCode || '');
    formData.append('GeneralInfo.City', generalInfo.city || '');
    formData.append('GeneralInfo.State', generalInfo.state || '');
    formData.append('GeneralInfo.Email', generalInfo.email || '');
    // Solo agregar el teléfono si tiene un valor
    if (generalInfo.phone) {
      formData.append('GeneralInfo.Phone', generalInfo.phone);
    }
    formData.append('GeneralInfo.Mobile', generalInfo.mobile || '');
    formData.append(
      'GeneralInfo.ExpertiseAreas',
      JSON.stringify(generalInfo.expertiseAreas || '')
    );
    formData.append('GeneralInfo.Center', generalInfo.center || '');

    // Agregar historial académico
    const academicHistory = this.academicBackgroundCmp.dataSource || [];
    academicHistory.forEach((item: any, index: number) => {
      formData.append(
        `AcademicHistories[${index}].education_level`,
        item.nivelAcademico || ''
      );
      formData.append(`AcademicHistories[${index}].period`, item.periodo || '');
      formData.append(
        `AcademicHistories[${index}].institution`,
        item.institucion || ''
      );
      formData.append(
        `AcademicHistories[${index}].degree_awarded`,
        item.tituloOtorgado || ''
      );
      if (item.evidenciaFile) {
        formData.append(
          `AcademicHistories[${index}].Evidence`,
          item.evidenciaFile
        );
      }
    });

    // Agregar experiencia laboral
    const workExperience = this.workExperienceCmp.dataSource || [];
    workExperience.forEach((item: any, index: number) => {
      formData.append(`WorkExperiences[${index}].period`, item.periodo || '');
      formData.append(
        `WorkExperiences[${index}].organization`,
        item.organizacion || ''
      );
      formData.append(`WorkExperiences[${index}].position`, item.puesto || '');
      formData.append(
        `WorkExperiences[${index}].activity`,
        item.actividad || ''
      );
      if (item.evidenciaFile) {
        formData.append(
          `WorkExperiences[${index}].Evidence`,
          item.evidenciaFile
        );
      }
    });

    // Enviar datos al servicio
    this.instructorRegisterService.registerInstructor(formData).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Instructor registrado correctamente.',
        }).then(() => {
          this.router.navigate(['/profile/dashboard']);
        });
      },
      error: (error) => {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al registrar el instructor. Verifica los datos e intenta nuevamente.',
        });
      },
    });
  }

  onStepperSelectionChange(event: StepperSelectionEvent) {
    if (event.previouslySelectedIndex === 0 && this.firstFormGroup.invalid) {
      this.generalInfoCmp.markAllAsTouched();
    }
  }
}
