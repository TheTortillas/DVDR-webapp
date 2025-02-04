import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-view-schedule-dialog',
  standalone: true,
  imports: [
    MatDialogContent,
    MatTable,
    MatTableModule,
    MatDialogActions,
    MatButtonModule,
  ],
  templateUrl: './view-schedule-dialog.component.html',
  styleUrl: './view-schedule-dialog.component.scss',
})
export class ViewScheduleDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { schedule: any[] },
    private dialogRef: MatDialogRef<ViewScheduleDialogComponent>
  ) {}

  closeDialog() {
    this.dialogRef.close();
  }
}
