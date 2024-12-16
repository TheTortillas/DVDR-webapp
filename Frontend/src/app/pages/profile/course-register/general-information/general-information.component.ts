import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
//import { StepperIndicatorComponent } from "../../components/stepper-indicator/stepper-indicator.component";
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
//import {provideMomentDateAdapter} from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
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
import { InstructorRegisterComponent } from '../../instructor-register/instructor-register.component';

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
    InstructorRegisterComponent,
  ],
  templateUrl: './general-information.component.html',
  styleUrl: './general-information.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralInformationComponent {
  //-------------------------------------- TIPO SERVICIO ---------------------------------------
  typeService: number = 0;

  onOtroServicioChange(event: any) {
    this.typeService = event.value;
  }
  //-------------------------------------- CATEGORÍA ---------------------------------------
  categories: string[] = [
    'Ingeniería y Ciencias Físico-Matemáticas',
    'Ciencias Médico Biológicas',
    'Ciencias Sociales y Administrativas',
    'Desarrollo Humano',
    'Idiomas',
    'Multidisciplinarios',
    'Educación',
    'TIC',
  ];
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
    if (!this.tieneConvenio) {
      this.selectedConvenioOption = '';
    }
  }

  onConvenioOptionChange(event: any) {
    this.selectedConvenioOption = event.value;
  }

  //-------------------------------------- UNIDAD  RESPONSABLE ---------------------------------------
  unidadTipo: string = '';
  unidadOptions: string[] = [];
  selectedUnidadOption: string = '';
  dvdrsOptions: string[] = [
    'Centro de Vinculación y Desarrollo Regional Unidad Tampico',
    'Centro de Vinculación y Desarrollo Regional Culiacán',
    'Centro de Vinculación y Desarrollo Regional Unidad Cajeme',
    'Centro de Vinculación y Desarrollo Regional Unidad Cancún',
    'Centro de Vinculación y Desarrollo Regional Unidad Campeche',
    'Centro de Vinculación y Desarrollo Regional Durango',
    'Centro de Vinculación y Desarrollo Regional Unidad Los Mochis',
    'Centro de Desarrollo y Vinculación Regional Unidad Mazatlán',
    'Centro de Vinculación y Desarrollo Regional Unidad Morelia',
    'Centro de Vinculación y Desarrollo Regional Unidad Tlaxcala',
    'Centro de Vinculación y Desarrollo Regional Unidad Oaxaca',
    'Centro de Vinculación y Desarrollo Regional Unidad Tijuana',
  ];

  cittasOptions: string[] = [
    'Centro de Innovación e Integración de Tecnologías Avanzadas Chihuahua',
    'Centro de Innovación e Integración de Tecnologías Avanzadas Puebla',
    'Centro de Innovación e Integración de Tecnologías Avanzadas Veracruz',
  ];

  // Esta función actualiza las opciones del segundo select
  onUnidadChange(event: any) {
    this.unidadTipo = event.value;
    if (this.unidadTipo === 'DVDR') {
      this.unidadOptions = this.dvdrsOptions;
    } else if (this.unidadTipo === 'CITTA') {
      this.unidadOptions = this.cittasOptions;
    } else {
      this.unidadOptions = [];
    }
  }

  onunidadOptionChange(event: any) {
    this.selectedUnidadOption = event.value;
    //console.log(this.unidadTipo + ": " +this.selectedUnidadOption);
  }

  //-------------------------------------- ESCOLARIDAD ---------------------------------------
  escolaridadOptions: string[] = ['Escolarizada', 'No Escolarizada', 'Mixta'];
  selectedEscolaridadOption: string = '';

  onEscolaridadChange(event: any) {
    this.selectedEscolaridadOption = event.value;
  }

  //-------------------------------------- OFERTA EDUCATIVA ---------------------------------------
  ofertaEducativaOptions: string[] = ['Medio Superior', 'Superior', 'Posgrado'];
  selectedOfertaEducativaOption: string = '';

  onOfertaEducativaChange(event: any) {
    this.selectedOfertaEducativaOption = event.value;
  }

  //-------------------------------------- SEDE ---------------------------------------
  otroSeleccionado: boolean = false;

  onOtroChange(event: any) {
    this.otroSeleccionado = event.checked;
  }

  //-------------------------------------- AUTORES  ---------------------------------------

  personas: string[] = [
    'Juan Pérez',
    'María Gómez',
    'Carlos López',
    'Ana Martínez',
    'Jorge Rodríguez',
  ];

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
        this.seleccionados.push({ nombre: this.selectedPersona, rol: 'Autor' }); // Por defecto como 'Autor'
        this.dataSource.data = this.seleccionados; // Update the dataSource
        console.log(this.seleccionados);
        this.selectedPersona = ''; // Limpiar la selección
      }
    }
  }

  // Método para eliminar personas de la tabla
  removePersona(index: number) {
    this.seleccionados.splice(index, 1);
    this.dataSource.data = this.seleccionados; // Update the dataSource
  }
}
