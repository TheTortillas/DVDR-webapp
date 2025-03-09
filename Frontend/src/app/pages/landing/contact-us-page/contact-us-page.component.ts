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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MessagesService } from '../../../core/services/messages.service';
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
    MatDividerModule,
  ],
  templateUrl: './contact-us-page.component.html',
  styleUrl: './contact-us-page.component.scss',
})
export class ContactUsPageComponent implements OnInit {
  contactForm!: FormGroup;

  constructor(private messagesService: MessagesService) {}

  ngOnInit() {
    this.contactForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      subject: new FormControl('', [Validators.required]),
      message: new FormControl('', [Validators.required]),
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.messagesService.sendMessage(this.contactForm.value).subscribe({
        next: (response) => {
          Swal.fire({
            title: 'Mensaje Enviado',
            text: 'Pronto nos contactaremos contigo',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          this.contactForm.reset();
        },
        error: (error) => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo enviar el mensaje. Por favor, intenta más tarde.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        },
      });
    }
  }
}
