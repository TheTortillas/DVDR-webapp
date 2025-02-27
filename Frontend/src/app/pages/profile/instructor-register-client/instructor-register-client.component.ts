import { Component } from '@angular/core';
import { InstructorRegisterComponent } from '../../../shared/components/instructor-register/instructor-register.component';

@Component({
  selector: 'app-instructor-register-client',
  standalone: true,
  imports: [InstructorRegisterComponent],
  templateUrl: './instructor-register-client.component.html',
  styleUrl: './instructor-register-client.component.scss',
})
export class InstructorRegisterClientComponent {}
