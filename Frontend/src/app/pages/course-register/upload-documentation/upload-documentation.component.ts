import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-upload-documentation',
  standalone: true,
  imports: [MatButton,MatIcon ],
  templateUrl: './upload-documentation.component.html',
  styleUrl: './upload-documentation.component.scss'
})
export class UploadDocumentationComponent {
  csvInputChange(fileInputEvent: any) {
    console.log(fileInputEvent.target.files[0]);
  }
}
