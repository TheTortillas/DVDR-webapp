import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WorkExperienceDialogComponent } from '../../../../shared/components/work-experience-dialog/work-experience-dialog.component';
import { MatButton } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';

export interface WorkExperience {
  desde: string;
  hasta: string;
  organizacion: string;
  puesto: string;
  actividad: string;
  evidencia: string;
}

const ELEMENT_DATA_WORK: WorkExperience[] = [
  {
    desde: '01/2015',
    hasta: '05/2018',
    organizacion: 'Empresa Y',
    puesto: 'Desarrollador',
    actividad: 'Desarrollo de software',
    evidencia: 'Ver',
  },
  // Agrega más datos según sea necesario
];

@Component({
  selector: 'app-work-experience',
  standalone: true,
  imports: [MatButton, MatTableModule, MatIcon],
  templateUrl: './work-experience.component.html',
  styleUrl: './work-experience.component.scss',
})
export class WorkExperienceComponent {
  displayedColumns: string[] = [
    'desde',
    'hasta',
    'organizacion',
    'puesto',
    'actividad',
    'evidencia',
  ];
  dataSource = ELEMENT_DATA_WORK;

  readonly dialog = inject(MatDialog);

  constructor() {}

  openDialog(
    enterAnimationDuration: string,
    exitAnimationDuration: string
  ): void {
    this.dialog.open(WorkExperienceDialogComponent, {
      width: '800px',
      disableClose: true,
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
}
