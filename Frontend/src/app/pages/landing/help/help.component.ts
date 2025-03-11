import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface TutorialVideo {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail?: string;
}

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss',
})
export class HelpComponent {
  videos: TutorialVideo[] = [
    {
      id: 1,
      title: 'Cómo registrar un nuevo curso',
      description:
        'En este tutorial aprenderás el proceso completo de registro de un nuevo curso en la plataforma, desde la información básica hasta la documentación requerida.',
      videoUrl: 'https://www.youtube.com/embed/Qu0dIn3_2Zc',
      thumbnail: 'https://img.youtube.com/vi/Qu0dIn3_2Zc/maxresdefault.jpg',
    },
    {
      id: 2,
      title: 'Gestión de diplomados',
      description:
        'Aprende a crear, editar y dar seguimiento a los diplomados registrados en el sistema.',
      videoUrl: 'https://youtu.be/Qu0dIn3_2Zc?si=Qu0dIn3_2Zc',
      thumbnail: 'https://img.youtube.com/vi/Qu0dIn3_2Zc/maxresdefault.jpg',
    },
    {
      id: 3,
      title: 'Administración de usuarios',
      description:
        'Tutorial sobre cómo gestionar usuarios, asignar roles y permisos en la plataforma.',
      videoUrl: 'https://www.youtube.com/embed/Qu0dIn3_2Zc',
      thumbnail: 'https://img.youtube.com/vi/Qu0dIn3_2Zc/maxresdefault.jpg',
    },
    {
      id: 4,
      title: 'Manejo de plantillas',
      description:
        'Aprende a subir, actualizar y usar las diferentes plantillas para documentos en la plataforma.',
      videoUrl: 'https://www.youtube.com/embed/Qu0dIn3_2Zc',
      thumbnail: 'https://img.youtube.com/vi/Qu0dIn3_2Zc/maxresdefault.jpg',
    },
  ];

  activeVideo: TutorialVideo | null = null;
  safeVideoUrl: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  playVideo(video: TutorialVideo): void {
    this.activeVideo = video;
    this.safeVideoUrl = this.getSafeUrl(video.videoUrl);
  }
}
