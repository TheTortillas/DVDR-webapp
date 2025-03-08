import { Component, OnInit, Input, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DiplomasService } from '../../../../core/services/diplomas.service';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { DataService } from '../../../../core/services/data.service';

@Component({
  selector: 'app-upload-diploma-certificates-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogTitle,
    MatDialogActions,
    MatDialogClose,
  ],
  templateUrl: './upload-diploma-certificates-dialog.component.html',
  styleUrls: ['./upload-diploma-certificates-dialog.component.scss'],
})
export class UploadDiplomaCertificatesDialogComponent implements OnInit {
  @Input() diplomaId!: number;
  title: string = '';
  startDate: string = '';
  endDate: string = '';
  displayedColumns = ['icon', 'name', 'files', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  fileMap: { [key: number]: File | null } = {};

  constructor(
    private diplomasService: DiplomasService,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<UploadDiplomaCertificatesDialogComponent>
  ) {
    this.title = data.title;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.diplomaId = data.diplomaId;
  }

  ngOnInit() {
    this.loadTemplates();
  }

  loadTemplates() {
    this.dataService.getCertificateDocumentTemplates().subscribe({
      next: (data) => {
        this.dataSource.data = data;
      },
      error: (err) => console.error('Error loading templates:', err),
    });
  }

  onInputChange(event: any, fileIndex: number): void {
    const file = event.target.files[0];
    if (file) {
      this.dataSource.data = this.dataSource.data.map((row) => {
        if (row.id === fileIndex) {
          return { ...row, uploadedFile: file };
        }
        return row;
      });
    }
  }

  deleteFile(fileIndex: number): void {
    this.dataSource.data = this.dataSource.data.map((row) => {
      if (row.id === fileIndex) {
        return { ...row, uploadedFile: undefined };
      }
      return row;
    });
  }

  verArchivo(element: any): void {
    if (element.uploadedFile) {
      const fileURL = URL.createObjectURL(element.uploadedFile);
      window.open(fileURL, '_blank');
    }
  }

  areAllRequiredDocsUploaded(): boolean {
    return this.dataSource.data.every(
      (row) => !row.required || row.uploadedFile
    );
  }

  onSubmit() {
    const missingDocs = this.dataSource.data
      .filter((doc) => doc.required && !doc.uploadedFile)
      .map((doc) => doc.name);

    if (missingDocs.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Documentos faltantes',
        html: `Por favor, sube los siguientes documentos:<br>${missingDocs.join(
          '<br>'
        )}`,
      });
      return;
    }

    const formData = new FormData();
    formData.append('diplomaId', this.diplomaId.toString());

    this.dataSource.data.forEach((doc, index) => {
      if (doc.uploadedFile) {
        formData.append(`Documents[${index}].DocumentId`, doc.id.toString());
        formData.append(`Documents[${index}].File`, doc.uploadedFile);
      }
    });

    this.diplomasService.requestDiplomaCertificates(formData).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Documentos enviados correctamente',
          text: 'Los documentos han sido enviados para su revisión',
        });
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al enviar los documentos',
        });
      },
    });
  }
}
