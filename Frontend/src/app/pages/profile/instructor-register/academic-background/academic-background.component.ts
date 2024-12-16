import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EvidenceDialogComponent } from '../../../../shared/components/evidence-dialog/evidence-dialog.component';
import { MatButton } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';

export interface AcademicBackground {
  nivelEscolar: string;
  periodo: string;
  institucion: string;
  tituloOtorgado: string;
  evidencia: string;
}

const ELEMENT_DATA: AcademicBackground[] = [
  {
    nivelEscolar: 'Licenciatura',
    periodo: '2010-2014',
    institucion: 'Universidad X',
    tituloOtorgado: 'Ingeniero',
    evidencia: 'Ver',
  },
  // Agrega más datos según sea necesario
];

@Component({
  selector: 'app-academic-background',
  standalone: true,
  imports: [MatButton, MatTableModule, MatIcon],
  templateUrl: './academic-background.component.html',
  styleUrl: './academic-background.component.scss',
})
export class AcademicBackgroundComponent {
  displayedColumns: string[] = [
    'nivelEscolar',
    'periodo',
    'institucion',
    'tituloOtorgado',
    'evidencia',
  ];
  dataSource = ELEMENT_DATA;

  readonly dialog = inject(MatDialog);

  constructor() {}

  openDialog(
    enterAnimationDuration: string,
    exitAnimationDuration: string
  ): void {
    this.dialog.open(EvidenceDialogComponent, {
      width: '40%',
      disableClose: true,
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
}
