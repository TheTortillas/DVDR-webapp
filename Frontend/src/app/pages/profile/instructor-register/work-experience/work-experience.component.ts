import { Component, EventEmitter, inject, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WorkExperienceDialogComponent } from '../../../../shared/components/work-experience-dialog/work-experience-dialog.component';
import { MatButton } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';

export interface WorkExperience {
  periodo: string;
  organizacion: string;
  puesto: string;
  actividad: string;
  evidencia: string;
}

@Component({
  selector: 'app-work-experience',
  standalone: true,
  imports: [MatButton, MatTableModule, MatIcon],
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

  dataSource: WorkExperience[] = [
    {
      periodo: '01/2015 - 05/2018',
      organizacion: 'Empresa Y',
      puesto: 'Desarrollador',
      actividad: 'Desarrollo de software',
      evidencia: 'Ver',
    },
  ];

  constructor(private dialog: MatDialog) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(WorkExperienceDialogComponent, {
      autoFocus: false,
      width: '40%',
    });

    dialogRef.afterClosed().subscribe((result: WorkExperience | undefined) => {
      if (result) {
        this.dataSource = [...this.dataSource, result];
        this.dataSourceChange.emit(this.dataSource.length > 0);
      }
    });
  }

  verEvidencia(element: WorkExperience): void {
    // Abre la URL del archivo en una nueva ventana
    window.open(element.evidencia, '_blank');
  }

  eliminarEvidencia(element: WorkExperience): void {
    this.dataSource = this.dataSource.filter((e) => e !== element);
    this.dataSourceChange.emit(this.dataSource.length > 0);
  }
}
