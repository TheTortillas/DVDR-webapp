import { Component, Inject } from '@angular/core';
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
export class GeneralInfoDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: CourseFullData
  ) {}
}
