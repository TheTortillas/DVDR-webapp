import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { StorageService } from '../../../core/services/storage.service';
import { DiplomasService } from '../../../core/services/diplomas.service';
import { UploadDiplomaCertificatesDialogComponent } from './upload-diploma-certificates-dialog/upload-diploma-certificates-dialog.component';

@Component({
  selector: 'app-request-diploma-certificates',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
  templateUrl: './request-diploma-certificates.component.html',
  styleUrls: ['./request-diploma-certificates.component.scss'],
})
export class RequestDiplomaCertificatesComponent implements OnInit {
  username: string | null = null;
  completedDiplomas: any[] = [];
  displayedColumns: string[] = ['title', 'clave', 'periodo', 'action'];

  constructor(
    private diplomasService: DiplomasService,
    private dialog: MatDialog,
    private storageService: StorageService,
    private router: Router
  ) {}

  ngOnInit() {
    const token = this.storageService.getItem('token');
    if (token) {
      const claims = this.storageService.getTokenClaims(token);
      if (claims) {
        this.username = claims.username;
        this.loadCompletedDiplomas();
      } else {
        console.error('No se pudieron obtener los claims del token');
        this.router.navigate(['/auth/login']);
      }
    } else {
      console.error('No hay token disponible');
      this.router.navigate(['/auth/login']);
    }
  }

  // ...existing code...

  loadCompletedDiplomas() {
    if (this.username) {
      this.diplomasService.getCompletedDiplomas(this.username).subscribe({
        next: (response: any) => {
          // Procesar las fechas antes de asignarlas
          this.completedDiplomas = response.map((diploma: any) => {
            return {
              ...diploma,
              // No aplicamos transformación aquí, usamos las fechas como vienen
            };
          });
        },
        error: (err) => {
          console.error('Error al obtener diplomados:', err);
        },
      });
    }
  }

  requestCertificate(item: any) {
    const dialogRef = this.dialog.open(
      UploadDiplomaCertificatesDialogComponent,
      {
        maxWidth: '100vh',
        maxHeight: '100vh',
        width: '45%',
        height: '65%',
        autoFocus: false,
        data: {
          diplomaId: item.diplomaId,
          title: item.title,
          startDate: item.startDate,
          endDate: item.endDate,
        },
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const index = this.completedDiplomas.findIndex(
          (diploma) => diploma.diplomaId === item.diplomaId
        );
        if (index !== -1) {
          this.completedDiplomas[index].certificatesRequested = true;
          this.completedDiplomas = [...this.completedDiplomas];
        }
      }
    });
  }

  viewCertificateLetter(diplomaId: number) {
    this.diplomasService.getCertificateOfficialLetter(diplomaId).subscribe({
      next: (response) => {
        if (response.filePath) {
          window.open(response.filePath, '_blank');
        }
      },
      error: (error) => {
        console.error('Error al obtener el oficio:', error);
      },
    });
  }
}
