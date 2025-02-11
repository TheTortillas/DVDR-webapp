import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { Document } from '../../../../core/services/courses.service';

@Component({
  selector: 'app-documentation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './documentation-dialog.component.html',
  styleUrl: './documentation-dialog.component.scss',
})
export class DocumentationDialogComponent {
  displayedColumns: string[] = ['name', 'file'];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      courseKey: string;
      documents: Document[];
    }
  ) {}
}
