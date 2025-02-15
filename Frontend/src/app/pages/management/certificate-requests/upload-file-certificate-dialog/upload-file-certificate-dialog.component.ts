import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CoursesService } from '../../../../core/services/courses.service';

@Component({
  selector: 'app-upload-file-certificate-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatTooltipModule,
  ],
  templateUrl: './upload-file-certificate-dialog.component.html',
  styleUrl: './upload-file-certificate-dialog.component.scss',
})
export class UploadFileCertificateDialogComponent {
  uploadedFile: File | null = null;
  certificatesCount: number = 0;

  constructor(
    private coursesService: CoursesService,
    private dialogRef: MatDialogRef<UploadFileCertificateDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      sessionId: number;
      courseName: string;
      period: string;
    }
  ) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.uploadedFile = file;
    }
  }

  viewFile() {
    if (this.uploadedFile) {
      const fileURL = URL.createObjectURL(this.uploadedFile);
      window.open(fileURL, '_blank');
    }
  }

  removeFile() {
    this.uploadedFile = null;
  }

  isValid(): boolean {
    return this.uploadedFile !== null && this.certificatesCount > 0;
  }

  submit() {
    if (this.isValid()) {
      const formData = new FormData();
      formData.append('sessionId', this.data.sessionId.toString());
      formData.append('certificatesCount', this.certificatesCount.toString());
      formData.append('file', this.uploadedFile!);

      this.coursesService.UploadCertificateOfficialLetter(formData).subscribe({
        next: (response) => {
          this.dialogRef.close({
            success: true,
            response: response,
          });
        },
        error: (error) => {
          console.error('Error uploading certificate:', error);
          // Puedes manejar el error aquí, por ejemplo mostrando un mensaje al usuario
          this.dialogRef.close({
            success: false,
            error: error,
          });
        },
      });
    }
  }

  close() {
    this.dialogRef.close();
  }
}
