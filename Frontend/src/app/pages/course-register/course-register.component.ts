import { Component, inject } from '@angular/core';
import {FormBuilder, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';
import {MatButtonModule} from '@angular/material/button'
import {MatIconModule} from '@angular/material/icon';
import { GeneralInformationComponent } from "./general-information/general-information.component";
import { UploadDocumentationComponent } from './upload-documentation/upload-documentation.component';
import { RequestRegistrationComponent } from "./request-registration/request-registration.component";
import { RequestAuthorizationComponent } from "./request-authorization/request-authorization.component";
import { DownloadCertificatesComponent } from './download-certificates/download-certificates.component';

@Component({
  selector: 'app-course-register',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatStepperModule, MatButtonModule, MatIconModule,
    GeneralInformationComponent, UploadDocumentationComponent, RequestRegistrationComponent, RequestAuthorizationComponent, DownloadCertificatesComponent],
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
