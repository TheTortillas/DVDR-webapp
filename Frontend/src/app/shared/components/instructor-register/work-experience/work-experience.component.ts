import { Component, EventEmitter, inject, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WorkExperienceDialogComponent } from '../../work-experience-dialog/work-experience-dialog.component';
import { MatButton } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

export interface WorkExperience {
  periodo: string;
  organizacion: string;
  puesto: string;
  actividad: string;
  evidencia: string;
  evidenciaFile?: File; // Archivo físico
}

@Component({
  selector: 'app-work-experience',
  standalone: true,
  imports: [MatButton, MatTableModule, MatIcon, MatTooltip],
  templateUrl: './work-experience.component.html',
  styleUrl: './work-experience.component.scss',
})
export class WorkExperienceComponent {
  @Output() dataSourceChange = new EventEmitter<boolean>();

  displayedColumns: string[] = [
    'periodo',
    'organizacion',
    'puesto',
    'actividad',
    'evidencia',
    'eliminar',
  ];

  dataSource: WorkExperience[] = [];

  constructor(private dialog: MatDialog) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(WorkExperienceDialogComponent, {
      autoFocus: false,
      width: '40%',
    });

    dialogRef.afterClosed().subscribe((result: WorkExperience | undefined) => {
      if (result) {
        const newExperience: WorkExperience = {
          periodo: result.periodo,
          organizacion: result.organizacion,
          puesto: result.puesto,
          actividad: result.actividad,
          evidencia: result.evidencia,
          evidenciaFile: result.evidenciaFile, // Store the file
        };

        this.dataSource = [...this.dataSource, newExperience];
        this.dataSourceChange.emit(this.dataSource.length > 0);
      }
    });
  }

  verEvidencia(element: WorkExperience): void {
    if (element.evidenciaFile) {
      const url = URL.createObjectURL(element.evidenciaFile);
      window.open(url, '_blank');
    } else if (element.evidencia) {
      window.open(element.evidencia, '_blank');
    }
  }

  eliminarEvidencia(element: WorkExperience): void {
    this.dataSource = this.dataSource.filter((e) => e !== element);
    this.dataSourceChange.emit(this.dataSource.length > 0);
  }
}
