import { Component, inject, OnInit, ViewChild } from '@angular/core';
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
import { ActivatedRoute, Router } from '@angular/router';
import {
  STEPPER_GLOBAL_OPTIONS,
  StepperSelectionEvent,
} from '@angular/cdk/stepper';

import { FilesService } from '../../../core/services/files.service';
import { CoursesService } from '../../../core/services/courses.service';
import Swal from 'sweetalert2';
import { StorageService } from '../../../core/services/storage.service';

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
export class CourseRegisterComponent implements OnInit {
  @ViewChild(GeneralInformationComponent)
  private generalInfoChild!: GeneralInformationComponent;
  @ViewChild(UploadDocumentationComponent)
  private uploadDocChild!: UploadDocumentationComponent;

  username: string | null = null;

  isRenewal: boolean = false;
  parentCourseId: number | null = null;

  private _formBuilder = inject(FormBuilder);
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private filesService: FilesService,
    private coursesService: CoursesService,
    private storageService: StorageService
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
    educational_platform: [[] as string[], Validators.required], // plataforma-ed
    custom_platform: [''], // plataforma-ed-personalizada
    actors: [[], [actorsValidator()]],
  });

  secondFormGroup = this._formBuilder.group(
    {},
    {
      validators: () => {
        // Si el componente hijo no está inicializado, no mostrar error aún
        if (!this.uploadDocChild?.dataSource?.data) {
          return { requiredDocsMissing: true };
        }

        // Usar la misma lógica que funciona en el método areAllRequiredDocsUploaded
        const hasAllRequired = this.uploadDocChild.areAllRequiredDocsUploaded();
        return hasAllRequired ? null : { requiredDocsMissing: true };
      },
    }
  );

  isLinear = false;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['renewal']) {
        this.isRenewal = true;
        this.parentCourseId = params['parentCourseId'];

        if (this.parentCourseId) {
          // ✅ Hacer la petición al backend para obtener los datos completos
          this.coursesService.getCourseById(this.parentCourseId).subscribe({
            next: (courseInfo) => {
              this.loadCourseData(courseInfo);
            },
            error: (err) => {
              console.error('Error al obtener el curso:', err);
            },
          });
        }
      }
    });
  }

  private loadCourseData(courseInfo: any) {
    // ✅ Convertir el tipo de servicio en un string (Curso, Diplomado, Otro)
    let serviceTypeValue = 'Curso'; // Por defecto "Curso"
    if (courseInfo.courseInfo.serviceType === 'Diplomado')
      serviceTypeValue = 'Diplomado';
    if (courseInfo.courseInfo.serviceType === 'Otro') serviceTypeValue = 'Otro';

    // ✅ Convertir plataformas en array (para el multi-select)
    let platforms: string[] = [];

    if (typeof courseInfo.courseInfo.educationalPlatform === 'string') {
      platforms = courseInfo.courseInfo.educationalPlatform
        .split(',')
        .map((p: string) => p.trim());
    } else if (Array.isArray(courseInfo.courseInfo.educationalPlatform)) {
      platforms = courseInfo.courseInfo.educationalPlatform;
    }
    console.log('Plataformas cargadas:', platforms); // 🔍 Verificar en consola

    // ✅ Verificar si "Otro" está seleccionado
    const customPlatformUsed = platforms.includes('Otro');
    const customPlatformValue = customPlatformUsed
      ? courseInfo.courseInfo.customPlatform
      : '';

    // Primero establecemos los valores
    this.firstFormGroup.patchValue(
      {
        course_name: courseInfo.courseInfo.courseName,
        service_type: serviceTypeValue,
        category: courseInfo.courseInfo.category,
        agreement: courseInfo.courseInfo.agreement,
        total_duration: courseInfo.courseInfo.totalDuration,
        modality: courseInfo.courseInfo.modality,
        educational_offer: courseInfo.courseInfo.educationalOffer,
        educational_platform:
          platforms.length > 0 ? platforms : ([] as string[]),
        custom_platform: customPlatformValue,
        actors: courseInfo.courseInfo.actors,
      },
      { emitEvent: true }
    );

    // Usamos setTimeout para asegurar que el ciclo de detección de cambios se complete
    setTimeout(() => {
      // Después deshabilitamos los campos
      this.firstFormGroup.controls['course_name'].disable();
      this.firstFormGroup.controls['service_type'].disable();
      this.firstFormGroup.controls['category'].disable();
      this.firstFormGroup.controls['total_duration'].disable();
      this.firstFormGroup.controls['modality'].disable();
      this.firstFormGroup.controls['educational_offer'].disable();

      // Forzamos la actualización del valor de category
      this.firstFormGroup.get('category')?.updateValueAndValidity();
      this.firstFormGroup.get('educational_platform')?.updateValueAndValidity();
    }, 0);

    // ✅ Deshabilitar campos que no pueden modificarse
    this.firstFormGroup.controls['course_name'].disable();
    this.firstFormGroup.controls['service_type'].disable();
    this.firstFormGroup.controls['category'].disable();
    this.firstFormGroup.controls['total_duration'].disable();
    this.firstFormGroup.controls['modality'].disable();
    this.firstFormGroup.controls['educational_offer'].disable();
    // this.firstFormGroup.controls['educational_platform'].disable();
  }

  onStepperSelectionChange(event: StepperSelectionEvent) {
    if (event.previouslySelectedIndex === 0 && this.firstFormGroup.invalid) {
      this.firstFormGroup.markAllAsTouched();
    }
    if (event.previouslySelectedIndex === 1) {
      this.secondFormGroup.updateValueAndValidity();
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
    if (!this.uploadDocChild.areAllRequiredDocsUploaded()) {
      Swal.fire(
        'Documentos requeridos',
        'Por favor suba toda la documentación requerida.',
        'warning'
      );
      this.secondFormGroup.setErrors({ requiredDocsMissing: true });
      return;
    }
    // 1) Obtenemos los archivos subidos desde el hijo
    const uploadedDocs = this.uploadDocChild.getUploadedDocuments();
    console.log('Archivos subidos en el hijo:', uploadedDocs);

    // 2) Si no hay archivos, podemos hacer alguna validación
    if (!uploadedDocs.length) {
      Swal.fire(
        'Documentos requeridos',
        'No ha subido ningun documento',
        'warning'
      );
      this.secondFormGroup.setErrors({ requiredDocsMissing: true });
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

  onSubmit() {
    if (
      this.firstFormGroup.invalid ||
      !this.uploadDocChild.areAllRequiredDocsUploaded()
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, completa todos los campos requeridos.',
      });
      return;
    }

    const formData = new FormData();
    const token = this.storageService.getItem('token');

    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.',
      }).then(() => {
        this.router.navigate(['/auth/login']);
      });
      return;
    }

    const claims = this.storageService.getTokenClaims(token);
    if (!claims) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.',
      }).then(() => {
        this.router.navigate(['/auth/login']);
      });
      return;
    }

    const folderName = Math.random().toString(36).substring(2, 15);
    // Usar el username de los claims
    formData.append('Username', claims.username);
    formData.append('FolderName', folderName); // Opcional

    // Agregar información general del curso
    const generalInfo = this.firstFormGroup.getRawValue();
    formData.append('CourseInfo.CourseName', generalInfo.course_name || '');
    formData.append('CourseInfo.ServiceType', generalInfo.service_type || '');
    formData.append('CourseInfo.Category', generalInfo.category || '');
    formData.append('CourseInfo.Agreement', generalInfo.agreement || '');
    formData.append(
      'CourseInfo.TotalDuration',
      generalInfo.total_duration?.toString() || ''
    );
    formData.append('CourseInfo.Modality', generalInfo.modality || '');
    formData.append(
      'CourseInfo.EducationalOffer',
      generalInfo.educational_offer || ''
    );
    formData.append(
      'CourseInfo.EducationalPlatform',
      JSON.stringify(generalInfo.educational_platform) || ''
    );
    formData.append(
      'CourseInfo.CustomPlatform',
      generalInfo.custom_platform || ''
    );

    const actors = (this.firstFormGroup.get('actors')?.value || []).map(
      (actor: any) => ({
        id: actor.id,
        name: actor.nombre, // Ensure using correct property names
        role: actor.rol, // Ensure using correct property names
      })
    );
    actors.forEach((actor, index) => {
      formData.append(`CourseInfo.Actors[${index}].Id`, actor.id.toString());
      formData.append(`CourseInfo.Actors[${index}].Name`, actor.name);
      formData.append(`CourseInfo.Actors[${index}].Role`, actor.role);
    });

    // formData.append('CourseInfo.Actors', JSON.stringify(actors));

    // Agregar documentación
    const uploadedDocs = this.uploadDocChild.getUploadedDocuments();
    uploadedDocs.forEach((doc, index) => {
      if (doc.uploadedFile) {
        formData.append(`Documents[${index}].DocumentId`, doc.id.toString());
        formData.append(
          `Documents[${index}].File`,
          doc.uploadedFile,
          doc.uploadedFile.name
        );
        formData.append(`Documents[${index}].Name`, doc.name);
        formData.append(
          `Documents[${index}].Required`,
          doc.required.toString()
        );
      }
    });

    // Asegurar que ParentCourseId se envíe si es una renovación
    if (this.isRenewal && this.parentCourseId) {
      formData.append('ParentCourseId', this.parentCourseId.toString());
    }

    console.log('Información enviada:', generalInfo);
    console.log('ParentCourseId:', this.parentCourseId);

    // Enviar los datos al servicio
    this.coursesService.registerCourse(formData).subscribe({
      next: (response) => {
        Swal.fire(
          'Éxito',
          'El curso se ha registrado exitosamente',
          'success'
        ).then(() => {
          this.router.navigate(['/profile/my-courses']);
        });
      },
      error: (error) => {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al registrar el curso. Verifica los datos e intenta nuevamente.',
        });
      },
    });
  }
}
