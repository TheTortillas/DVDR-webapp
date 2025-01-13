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
  FormsModule,
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

  form: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
  });

  readonly email = new FormControl('', [Validators.required, Validators.email]);
  errorMessage = signal('');
  constructor(private dataService: DataService) {
    merge(this.email.statusChanges, this.email.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());
  }

  ngOnInit() {
    this.dataService.getCategoriasAcademicas().subscribe((data: any) => {
      this.categories = data;
    });
  }

  updateErrorMessage() {
    if (this.email.hasError('required')) {
      this.errorMessage.set('Debes ingresar un correo válido');
    } else if (this.email.hasError('email')) {
      this.errorMessage.set('Correo inválido');
    } else {
      this.errorMessage.set('');
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
}
