import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  DataService,
  TutorialVideo,
} from '../../../core/services/data.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
})
export class HelpComponent implements OnInit {
  videos: TutorialVideo[] = [];
  activeVideo: TutorialVideo | null = null;
  safeVideoUrl: SafeResourceUrl | null = null;
  loading = false;
  error = false;

  constructor(
    private dataService: DataService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadVideos();
  }

  loadVideos() {
    //this.loading = true;
    this.dataService.getTutorialVideos().subscribe({
      next: (videos) => {
        this.videos = videos;
        //this.loading = false;
      },
      error: (error) => {
        //console.error('Error loading videos:', error);
        //this.error = true;
        //this.loading = false;
      },
    });
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  playVideo(video: TutorialVideo): void {
    this.activeVideo = video;
    this.safeVideoUrl = this.getSafeUrl(video.videoUrl);
  }
}
