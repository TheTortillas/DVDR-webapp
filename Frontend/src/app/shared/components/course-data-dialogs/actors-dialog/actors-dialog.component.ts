import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { Actor } from '../../../../core/services/courses.service';

@Component({
  selector: 'app-actors-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatTableModule, MatButtonModule],
  templateUrl: './actors-dialog.component.html',
  styleUrl: './actors-dialog.component.scss',
})
export class ActorsDialogComponent {
  displayedColumns: string[] = ['name', 'role'];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      courseKey: string;
      actors: Actor[];
    }
  ) {}
}
