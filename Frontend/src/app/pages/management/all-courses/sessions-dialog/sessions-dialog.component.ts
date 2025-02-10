import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sessions-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatTableModule, MatButtonModule],
  templateUrl: './sessions-dialog.component.html',
  styleUrl: './sessions-dialog.component.scss',
})
export class SessionsDialogComponent {
  displayedColumns: string[] = [
    'period',
    'participants',
    'certificates',
    'status',
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      courseKey: string;
      sessions: any[]; // Ajusta el tipo según tu modelo
    }
  ) {}
}
