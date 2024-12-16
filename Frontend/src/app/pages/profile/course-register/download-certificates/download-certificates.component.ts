import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';


@Component({
  selector: 'app-download-certificates',
  standalone: true,
  imports: [MatIcon, MatButton],
  templateUrl: './download-certificates.component.html',
  styleUrl: './download-certificates.component.scss'
})
export class DownloadCertificatesComponent {
  downloadFile() {
    const link = document.createElement('a');
    link.href = ''; // Cambia esta ruta por la ruta real de tu archivo
    link.download = 'file.pdf'; // Nombre del archivo que se descargará
    link.click();
  }
}
