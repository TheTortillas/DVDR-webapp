import { Component } from '@angular/core';
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { merge } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-page',
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
    RouterLink,
    CommonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush, //Este no sé pa' qué es
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  // constructor(private route: Router){}
  form: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  // Login(){
  //   if(this.form.get("email")?.value == 'ecc@g.com'){
  //       this.route.navigateByUrl("home");
  //   }
  // }

  readonly email = new FormControl('', [Validators.required, Validators.email]);
  readonly password = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
  ]);

  errorMessage = signal('');
  constructor(private authService: AuthService) {
    merge(this.email.statusChanges, this.email.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());
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
    event.preventDefault();
    this.authService.clima().subscribe((result) => {
      console.log(result);
    });

    // this.authService.postClima({  date: "2024-12-04",
    //   temperatureC: 0,
    //   summary: "string"}).subscribe(result => {
    //     console.log(result);
    //   });
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
}
