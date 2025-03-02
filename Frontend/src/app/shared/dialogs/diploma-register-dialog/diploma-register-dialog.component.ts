import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
  FormsModule,
  ValidationErrors,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
} from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { DataService } from '../../../core/services/data.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DiplomasService } from '../../../core/services/diplomas.service';
import { MatStepperModule } from '@angular/material/stepper';
import Swal from 'sweetalert2';

interface Instructor {
  id: number;
  nombre: string;
  centro: string;
  areasExpertise: string[];
  rol?: string | string[];
}

@Component({
  selector: 'app-diploma-register-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatTableModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIcon,
    MatStepperModule,
  ],
  templateUrl: './diploma-register-dialog.component.html',
  styleUrl: './diploma-register-dialog.component.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    provideMomentDateAdapter(),
  ],
})
export class DiplomaRegisterDialogComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  areasExpertise: string[] = [];

  // Tabla de “actores” que se integrarán al diplomado (en este caso, instructores)
  displayedInstructorColumns: string[] = [
    'select',
    'nombre',
    'areasExpertise',
    'centro',
  ];
  instructorsDataSource: MatTableDataSource<Instructor> =
    new MatTableDataSource<Instructor>([]);
  selection = new SelectionModel<Instructor>(true, []);

  // Arreglos y variables para filtros
  instructores: Instructor[] = [];
  searchText: string = '';
  selectedAreas: string[] = [];
  diplomaCenter: string = '';
  diplomaUsername: string = '';

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DiplomaRegisterDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { diplomaId: number; center: string; registeredBy: string },
    private dataService: DataService,
    private diplomasService: DiplomasService, // Añadir este servicio
    private cdr: ChangeDetectorRef,
    private dateAdapter: DateAdapter<any>
  ) {
    this.firstFormGroup = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        totalDuration: ['', [Validators.required, Validators.min(20)]],
        diplomaKey: ['', [Validators.required]], //  Validators.pattern(/^DVDR-\d{4}$/)
        serviceType: ['Diplomado', Validators.required],
        modality: ['', Validators.required],
        educationalOffer: ['', Validators.required],
        cost: [[Validators.required, Validators.min(100)]],
        participants: [[Validators.required, Validators.min(1)]],
        startDate: [null, Validators.required],
        endDate: [null, Validators.required],
        expirationDate: [null, Validators.required],
      },
      { validators: this.dateValidator }
    );

    this.secondFormGroup = this.fb.group({
      actorRoles: this.fb.array([]),
    });

    // Ajustar el adaptador de fecha a español
    this.dateAdapter.setLocale('es-ES');
    this.diplomaCenter = data.center;
    this.diplomaUsername = data.registeredBy;
  }

  // Validador personalizado para las fechas
  private dateValidator(group: FormGroup): ValidationErrors | null {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    const expiration = group.get('expirationDate')?.value;

    if (start && end && expiration) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const expirationDate = new Date(expiration);

      if (startDate >= endDate) {
        return { dateOrder: true };
      }
      if (endDate >= expirationDate) {
        return { expirationInvalid: true };
      }
    }
    return null;
  }

  // Getters para facilitar el acceso a los errores en el template
  getErrorMessage(controlName: string): string {
    const control = this.firstFormGroup.get(controlName);
    const formErrors = this.firstFormGroup.errors;

    // Verificar errores de fechas a nivel de formulario
    if (formErrors) {
      if (
        formErrors['dateOrder'] &&
        (controlName === 'startDate' || controlName === 'endDate')
      ) {
        return 'La fecha de inicio debe ser anterior a la fecha de fin';
      }
      if (
        formErrors['expirationInvalid'] &&
        (controlName === 'endDate' || controlName === 'expirationDate')
      ) {
        return 'La fecha de expiración debe ser posterior a la fecha de fin';
      }
    }

    // Errores individuales de los controles
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('min')) {
      const min = control.getError('min').min;
      return `El valor debe ser mayor o igual a ${min}`;
    }
    if (control?.hasError('pattern')) {
      return 'Formato inválido. Debe ser DVDR-XXXX';
    }
    if (control?.hasError('minlength')) {
      return 'El nombre debe tener al menos 3 caracteres';
    }
    return '';
  }

  ngOnInit(): void {
    // Cargar áreas de expertise
    this.dataService.getExpertiseAreas().subscribe({
      next: (areas) => {
        this.areasExpertise = areas;
      },
      error: (error) => {
        console.error('Error al cargar áreas de expertise:', error);
      },
    });
    //console.log('centro:', this.diplomaCenter);
    // Cargar instructores del centro del diplomado
    this.dataService.getInstructors().subscribe({
      next: (instructors: Instructor[]) => {
        // Filtrar instructores por el centro del diplomado
        this.instructores = instructors.filter(
          (inst) => inst.centro === this.diplomaCenter
        );
        this.instructorsDataSource.data = this.instructores;
        if (this.paginator) {
          this.instructorsDataSource.paginator = this.paginator;
        }

        console.log('Instructores cargados:', this.instructorsDataSource.data);
      },
      error: (error) => {
        console.error('Error al cargar instructores:', error);
      },
    });
  }

  /**
   * Getter práctico para el FormArray de actorRoles
   */
  get actorRoles(): FormArray {
    return this.secondFormGroup.get('actorRoles') as FormArray;
  }

  /**
   * Filtrar la tabla según texto y áreas de expertise
   */
  applyFilter() {
    let filteredData = this.instructores;

    // Texto de búsqueda
    if (this.searchText.trim()) {
      filteredData = filteredData.filter((inst) =>
        inst.nombre.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    // Filtro por áreas
    if (this.selectedAreas.length > 0) {
      filteredData = filteredData.filter((inst) =>
        this.selectedAreas.every((area) => inst.areasExpertise.includes(area))
      );
    }

    this.instructorsDataSource.data = filteredData;
    if (this.instructorsDataSource.paginator) {
      this.instructorsDataSource.paginator.firstPage();
    }
  }

  /**
   * Verifica si todos los instructores del datasource están seleccionados
   */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.instructorsDataSource.data.length;
    return numSelected === numRows;
  }

  /**
   * Seleccionar/deseleccionar todo
   */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.instructorsDataSource.data);
    }
  }

  /**
   * Agregar instructores seleccionados al FormArray 'actorRoles'
   */
  addSelectedInstructors(): void {
    const selected = this.selection.selected;
    selected.forEach((inst) => {
      const foundIndex = this.actorRoles.value.findIndex(
        (i: any) => i.id === inst.id
      );
      if (foundIndex === -1) {
        // Crear un FormGroup para cada instructor
        const instructorGroup = this.fb.group({
          id: [inst.id],
          nombre: [inst.nombre],
          rol: [[], [Validators.required, Validators.minLength(1)]],
        });
        this.actorRoles.push(instructorGroup);
      }
    });
  }

  // Añadir método para verificar errores de rol
  getRolErrorMessage(index: number): string {
    const control = this.actorRoles.at(index).get('rol');
    if (control?.hasError('required') || control?.hasError('minLength')) {
      return 'Debe seleccionar al menos un rol';
    }
    return '';
  }

  /**
   * Quitar un instructor (opcional) desde la lista final
   */
  removeInstructor(index: number) {
    this.actorRoles.removeAt(index);
  }

  /**
   * Enviar el formulario principal (ya incluye actorRoles con instructores seleccionados)
   */
  onSubmit(): void {
    const hasInvalidRoles = this.actorRoles.controls.some(
      (control) => !control.get('rol')?.value?.length
    );

    if (
      this.firstFormGroup.valid &&
      this.secondFormGroup.valid &&
      !hasInvalidRoles
    ) {
      const request = {
        diplomaId: this.data.diplomaId,
        name: this.firstFormGroup.get('name')?.value,
        totalDuration: this.firstFormGroup.get('totalDuration')?.value,
        diplomaKey: this.firstFormGroup.get('diplomaKey')?.value,
        serviceType: 'Diplomado',
        modality: this.firstFormGroup.get('modality')?.value,
        educationalOffer: this.firstFormGroup.get('educationalOffer')?.value,
        cost: this.firstFormGroup.get('cost')?.value,
        participants: this.firstFormGroup.get('participants')?.value,
        startDate: this.firstFormGroup.get('startDate')?.value,
        endDate: this.firstFormGroup.get('endDate')?.value,
        expirationDate: this.firstFormGroup.get('expirationDate')?.value,
        username: this.diplomaUsername, // Usar el username que viene del diplomado
        actorRoles: this.actorRoles.value.map(
          (actor: { id: number; rol: string[]; nombre: string }) => ({
            actorId: actor.id,
            name: actor.nombre,
            role: actor.rol.join(', '),
          })
        ),
      };
      // // Mostrar loading
      // Swal.fire({
      //   title: 'Procesando...',
      //   text: 'Por favor espere',
      //   allowOutsideClick: false,
      //   allowEscapeKey: false,
      //   didOpen: () => {
      //     Swal.showLoading();
      //   },
      // });

      this.diplomasService.approveDiplomaRequest(request).subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'El diplomado ha sido aprobado correctamente',
            confirmButtonText: 'Aceptar',
          }).then(() => {
            // Cerrar el diálogo con un objeto que indique éxito
            this.dialogRef.close({
              success: true,
              message: 'Diplomado aprobado correctamente',
            });
          });
        },
        error: (error) => {
          console.error('Error al aprobar el diplomado:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo aprobar el diplomado. Por favor intente de nuevo.',
            confirmButtonText: 'Aceptar',
          });
        },
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario inválido',
        text: 'Por favor complete todos los campos requeridos y asigne al menos un rol a cada instructor.',
        confirmButtonText: 'Entendido',
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close({ success: false, message: 'Operación cancelada' });
  }
}
