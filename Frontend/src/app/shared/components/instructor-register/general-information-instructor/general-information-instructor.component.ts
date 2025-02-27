import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { merge } from 'rxjs';
import { DataService } from '../../../../core/services/data.service';
import { MatSelectModule } from '@angular/material/select';
import { ErrorStateMatcher } from '@angular/material/core';

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

@Component({
  selector: 'app-general-information-instructor',
  standalone: true,
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatDivider,
    MatFormFieldModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatInputModule,
    CommonModule,
    MatSelectModule,
  ],
  templateUrl: './general-information-instructor.component.html',
  styleUrl: './general-information-instructor.component.scss',
})
export class GeneralInformationInstructorComponent {
  @Input() formGroup!: FormGroup;
  @Input() isAdmin: boolean = false; // Nuevo input para determinar si es admin

  centers: string[] = []; // Array para almacenar los centros

  matcher = new MyErrorStateMatcher();

  errorMessage = signal('');
  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService.getCategoriasAcademicas().subscribe((data: any) => {
      this.categories = data;
    });

    // Solo cargar los centros si es admin
    if (this.isAdmin) {
      this.dataService.getCenters().subscribe((centers: string[]) => {
        this.centers = centers;
      });
    }
  }

  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  //-------------------------------------- AREAS DE EXPERTISE ---------------------------------------
  categories: string[] = [];
  selectedCategory: string = '';

  onCategoryChange(event: any) {
    this.selectedCategory = event.value;
  }

  markAllAsTouched() {
    this.formGroup.markAllAsTouched();
  }
}
