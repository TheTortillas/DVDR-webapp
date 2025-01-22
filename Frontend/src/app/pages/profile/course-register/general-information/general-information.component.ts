import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
//import { StepperIndicatorComponent } from "../../components/stepper-indicator/stepper-indicator.component";
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  NgForm,
  FormGroupDirective,
  FormControl,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
//import {provideMomentDateAdapter} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  ErrorStateMatcher,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import {
  MatDatepickerIntl,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDivider } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import {
  MatSlideToggleModule,
  MatSlideToggleChange,
} from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ScheduleDialogComponent } from '../../../../shared/components/schedule-dialog/schedule-dialog.component';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DataService } from '../../../../core/services/data.service';
import { AddInstructorsDialogComponent } from '../../../../shared/components/add-instructors-dialog/add-instructors-dialog.component';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

interface Persona {
  id?: number;
  nombre: string;
  rol: string;
}

@Component({
  selector: 'app-general-information-instructor',
  standalone: true,
  imports: [
    MatDialogModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
    MatDivider,
    MatRadioModule,
    MatTooltipModule,
  ],
  templateUrl: './general-information.component.html',
  styleUrl: './general-information.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralInformationComponent implements OnInit {
  @Input() formGroup!: FormGroup;
  @Output() actorsChange = new EventEmitter<boolean>();
  matcher = new MyErrorStateMatcher();

  constructor(private dataService: DataService, private dialog: MatDialog) {}

  ngOnInit() {
    this.dataService.getCategoriasAcademicas().subscribe((data: any) => {
      this.categories = data;
    });

    this.formGroup.get('educational_platform')?.setValue([]);
  }

  //-------------------------------------- TIPO SERVICIO ---------------------------------------
  typeService: number = 0;

  onOtroServicioChange(event: any) {
    this.typeService = event.value;
  }
  onServiceTypeChange(event: any) {
    const val = event.value;
    this.typeService = val;

    if (val === 1) {
      this.formGroup.get('service_type')?.setValue('Curso');
    } else if (val === 2) {
      this.formGroup.get('service_type')?.setValue('Diplomado');
    } else {
      // Limpia para que el usuario escriba
      this.formGroup.get('service_type')?.reset();
    }
  }

  onOtherServiceTypeInput(event: any) {
    this.formGroup.get('service_type')?.setValue(event.target.value);
  }
  //-------------------------------------- CATEGORÍA ---------------------------------------
  categories: string[] = [];
  selectedCategory: string = '';

  onCategoryChange(event: any) {
    this.selectedCategory = event.value;
  }

  //-------------------------------------- CONVENIO ---------------------------------------
  tieneConvenio: boolean = false;
  categoriaConvenio: string = '';
  convenioOptions: string[] = ['Convenio', 'Instituciones', 'Otro'];
  selectedConvenioOption: string = '';

  tieneConvenioChange($event: MatSlideToggleChange) {
    this.tieneConvenio = $event.checked;
    if (this.tieneConvenio) {
      this.formGroup.get('agreement')?.setValidators(Validators.required);
    } else {
      this.formGroup.get('agreement')?.clearValidators();
      this.formGroup.get('agreement')?.setValue('');
    }
    this.formGroup.get('agreement')?.updateValueAndValidity();
  }

  onConvenioOptionChange(event: any) {
    this.selectedConvenioOption = event.value;
  }

  //-------------------------------------- DURACIÓN TOTAL ---------------------------------------
  duracionTotal: number | null = null;

  //-------------------------------------- MODALIDAD ---------------------------------------
  modalidadOptions: string[] = ['Escolarizada', 'No Escolarizada', 'Mixta'];
  selectedModalidadadOption: string = '';

  onModalidadChange(event: any) {
    this.selectedModalidadadOption = event.value;
  }

  //-------------------------------------- OFERTA EDUCATIVA ---------------------------------------
  ofertaEducativaOptions: string[] = ['Medio Superior', 'Superior', 'Posgrado'];
  selectedOfertaEducativaOption: string = '';

  onOfertaEducativaChange(event: any) {
    this.selectedOfertaEducativaOption = event.value;
  }

  //-------------------------------------- PLATAFORMA ---------------------------------------
  platformOptions: string[] = [
    'Google Meet',
    'Microsoft Teams',
    'Zoom',
    'Moodle',
    'Blackboard',
  ];
  platformSelections: string[] = [];
  otroPlatformSelected = false;

  onPlatformSelectionChange(selected: string[]) {
    this.otroPlatformSelected = selected.includes('Otro');
    this.platformSelections = selected.filter((p) => p !== 'Otro');

    // Update validators based on 'Otro' selection
    if (this.otroPlatformSelected) {
      this.formGroup.get('custom_platform')?.setValidators(Validators.required);
    } else {
      this.formGroup.get('custom_platform')?.clearValidators();
      this.formGroup.get('custom_platform')?.setValue('');
      // Set educational_platform value directly when no custom input is needed
      this.formGroup
        .get('educational_platform')
        ?.setValue(this.platformSelections);
    }

    this.formGroup.get('custom_platform')?.updateValueAndValidity();
  }

  onOtherPlatformChange(event: any) {
    const customValue = event.target.value;
    this.formGroup.get('custom_platform')?.setValue(customValue);

    if (customValue && this.otroPlatformSelected) {
      const platforms = [...this.platformSelections];
      const allPlatforms =
        platforms.length > 0
          ? `${platforms.join(',')},${customValue}`
          : customValue;
      this.formGroup.get('educational_platform')?.setValue(allPlatforms);
    }
  }
  //-------------------------------------- AUTORES  ---------------------------------------

  openAddInstructorsDialog() {
    const dialogRef = this.dialog.open(AddInstructorsDialogComponent, {
      width: '60%',
      height: '70%',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const newInstructors = result.map((instructor: any) => ({
          id: instructor.id,
          nombre: instructor.nombre,
          rol: 'Instructor',
        }));

        // Agrega los nuevos instructores seleccionados
        this.seleccionados = [...this.seleccionados, ...newInstructors];
        this.dataSource.data = this.seleccionados;

        // Actualiza el formulario
        this.formGroup.get('actors')?.setValue(this.seleccionados);
        this.formGroup.get('actors')?.markAsTouched();
      }
    });
  }

  selectedPersona: string = '';
  seleccionados: { nombre: string; rol: string }[] = [];

  // Initialize the dataSource with an empty array or your existing data
  dataSource = new MatTableDataSource<{ nombre: string; rol: string }>(
    this.seleccionados
  );

  // Método para agregar personas a la tabla
  addPersona() {
    if (this.selectedPersona) {
      const personaExistente = this.seleccionados.find(
        (p) => p.nombre === this.selectedPersona
      );
      if (!personaExistente) {
        const nuevaPersona: Persona = {
          nombre: this.selectedPersona,
          rol: 'Autor',
        };
        this.seleccionados.push(nuevaPersona);
        this.dataSource.data = this.seleccionados;
        this.selectedPersona = '';
        this.formGroup.get('actors')?.setValue(this.seleccionados);
        this.formGroup.get('actors')?.markAsTouched();
      }
    }
  }

  // Método para eliminar personas de la tabla
  removePersona(index: number) {
    this.seleccionados.splice(index, 1);
    this.dataSource.data = this.seleccionados;
    this.formGroup.get('actors')?.setValue(this.seleccionados);
    this.formGroup.get('actors')?.markAsTouched();
  }

  // Método para actualizar el rol de una persona
  updatePersonaRol(persona: Persona, nuevoRol: string) {
    persona.rol = nuevoRol;
    this.formGroup.get('actors')?.setValue(this.seleccionados);
  }
}
