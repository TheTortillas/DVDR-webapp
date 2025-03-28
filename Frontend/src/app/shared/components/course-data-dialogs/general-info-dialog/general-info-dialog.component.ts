import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CourseFullData } from '../../../../core/services/courses.service';

@Component({
  selector: 'app-general-info-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './general-info-dialog.component.html',
  styleUrl: './general-info-dialog.component.scss',
})
export class GeneralInfoDialogComponent implements OnInit {
  formattedPlatforms: string[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: CourseFullData
  ) {}

  ngOnInit(): void {
    this.processPlatforms();
  }

  private processPlatforms(): void {
    let platforms = this.data.courseInfo.educationalPlatform;

    // Si es string, intentar parsearlo
    if (typeof platforms === 'string') {
      try {
        platforms = JSON.parse(platforms);
      } catch (error) {
        console.error('Error parsing educationalPlatform:', error);
        // Si no se puede parsear, lo tratamos como una cadena individual
        this.formattedPlatforms = [String(platforms)];
        return;
      }
    }

    // Si después del parseo es un array, lo formateamos
    if (Array.isArray(platforms)) {
      this.formattedPlatforms = platforms.map((p) => {
        // Eliminamos comillas, corchetes, etc.
        if (typeof p === 'string') {
          return p.replace(/["\[\]]/g, '').trim();
        }
        return String(p);
      });
    } else if (platforms) {
      // Si no es un array pero existe, lo convertimos a string
      this.formattedPlatforms = [String(platforms)];
    } else {
      this.formattedPlatforms = [];
    }
  }
}
