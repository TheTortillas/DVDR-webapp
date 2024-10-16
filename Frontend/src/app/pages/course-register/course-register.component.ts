import { Component, inject } from '@angular/core';
import {FormBuilder, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';
import {MatButtonModule} from '@angular/material/button'
import { GeneralInformationComponent } from "./general-information/general-information.component";

@Component({
  selector: 'app-course-register',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatStepperModule, MatButtonModule, GeneralInformationComponent],
  templateUrl: './course-register.component.html',
  styleUrl: './course-register.component.scss'
})
export class CourseRegisterComponent {
  private _formBuilder = inject(FormBuilder);

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  thirdFormGroup = this._formBuilder.group({
    thirdCtrl: ['', Validators.required],
  });
  fourthFormGroup = this._formBuilder.group({
    fourthCtrl: ['', Validators.required],
  });
  fifthFormGroup = this._formBuilder.group({
    fifthCtrl: ['', Validators.required],
  });
  isLinear = false;
}
