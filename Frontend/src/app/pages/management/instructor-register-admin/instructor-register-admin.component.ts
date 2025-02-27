import { Component } from '@angular/core';
import { InstructorRegisterComponent } from '../../../shared/components/instructor-register/instructor-register.component';

@Component({
  selector: 'app-instructor-register-admin',
  standalone: true,
  imports: [InstructorRegisterComponent],
  templateUrl: './instructor-register-admin.component.html',
  styleUrl: './instructor-register-admin.component.scss',
})
export class InstructorRegisterAdminComponent {}
