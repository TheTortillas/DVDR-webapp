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
import { DiplomasService } from '../../../../core/services/diplomas.service';

@Component({
  selector: 'app-upload-file-diploma-certificate-dialog',
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
  templateUrl: './upload-file-diploma-certificate-dialog.component.html',
  styleUrl: './upload-file-diploma-certificate-dialog.component.scss',
})
export class UploadFileDiplomaCertificateDialogComponent {
  uploadedFile: File | null = null;
  certificatesCount: number = 0;

  constructor(
    private diplomasService: DiplomasService,
    private dialogRef: MatDialogRef<UploadFileDiplomaCertificateDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      diplomaId: number;
      diplomaTitle: string;
      period: string;
      numberOfCertificates: number;
    }
  ) {
    this.certificatesCount = 0;
  }

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
      formData.append('DiplomaId', this.data.diplomaId.toString());
      formData.append(
        'NumberOfCertificates',
        this.certificatesCount.toString()
      );
      formData.append('File', this.uploadedFile!);

      this.diplomasService.uploadDiplomaOfficialLetter(formData).subscribe({
        next: (response) => {
          this.dialogRef.close({
            success: true,
            response: response,
          });
        },
        error: (error) => {
          console.error('Error uploading diploma certificate:', error);
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
