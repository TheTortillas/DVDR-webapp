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
import { UserManagementService } from '../../../core/services/user-management.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { StorageService } from '../../../core/services/storage.service';

export interface UserSignIn {
  username: string;
  password: string;
}

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
  constructor(
    private userManagementService: UserManagementService,
    private storageService: StorageService,
    private router: Router
  ) {
    merge(this.username.statusChanges, this.username.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());
  }
  ngOnInit() {
    const token = this.storageService.getItem('token');
    if (token && this.storageService.isTokenValid(token)) {
      console.log('Token válido, redirigiendo al dashboard');
      this.router.navigate(['/profile/dashboard']);
    } else if (token) {
      console.log('Token inválido o caducado, limpiando datos');
      this.storageService.clear();
    }
  }

  // constructor(private route: Router){}
  // ngOnInit() {
  //   const token = localStorage.getItem('token');
  //   // Aquí podrías verificar si el token sigue siendo válido (decodificarlo o llamando a un endpoint)
  //   if (token) {
  //     this.router.navigate(['../../profile']);
  //   }
  // }

  form: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  // Login(){
  //   if(this.form.get("email")?.value == 'ecc@g.com'){
  //       this.route.navigateByUrl("home");
  //   }
  // }

  //event.preventDefault();
  // this.authService.clima().subscribe((result) => {
  //   console.log(result);
  // });

  // this.authService.postClima({  date: "2024-12-04",
  //   temperatureC: 0,
  //   summary: "string"}).subscribe(result => {
  //     console.log(result);
  //   });

  readonly username = new FormControl('', [Validators.required]);
  readonly password = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
  ]);

  errorMessage = signal('');

  updateErrorMessage() {
    if (this.username.hasError('required')) {
      this.errorMessage.set('Debes ingresar un nombre de usuario');
    } else {
      this.errorMessage.set('');
    }
  }

  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  signIn() {
    if (this.form.invalid) {
      console.log(
        'username:',
        this.form.get('username')?.value,
        'password:',
        this.form.get('password')?.value
      );
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, complete todos los campos.',
      });
      return;
    }

    const username = this.form.get('username')?.value;
    const password = this.form.get('password')?.value;

    // console.log('username:', username, 'password:', password);

    const user: UserSignIn = {
      username: username,
      password: password,
    };

    this.userManagementService.signIn(user).subscribe(
      (response) => {
        if (response?.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('username', response.username);
          localStorage.setItem('center', response.center);
          this.router.navigate(['/profile']);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Usuario o contraseña incorrectos.',
          });
        }
      },
      (error) => {
        console.error(error);

        if (error.status === 401) {
          Swal.fire({
            icon: 'warning',
            title: 'Usuario o contraseña incorrectos.',
            text: 'Por favor revise sus credenciales.',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error del servidor',
            text: 'Ocurrió un problema al conectarse al servidor.',
          });
        }
      }
    );
  }
}
