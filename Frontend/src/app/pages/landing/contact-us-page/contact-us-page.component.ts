import { Component, OnInit } from '@angular/core';
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
import { ChangeDetectionStrategy, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact-us-page',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatDividerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush, //Este no sé pa' qué es
  templateUrl: './contact-us-page.component.html',
  styleUrl: './contact-us-page.component.scss',
})
export class ContactUsPageComponent {
  onSubmit() {
    Swal.fire({
      title: 'Mensaje Enviado',
      text: 'Pronto nos contactaremos contigo',
      icon: 'success',
      confirmButtonText: 'OK',
    });
  }
}
