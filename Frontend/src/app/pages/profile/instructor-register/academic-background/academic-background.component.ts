import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EvidenceDialogComponent } from '../../../../shared/components/evidence-dialog/evidence-dialog.component';
import { MatButton } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';

export interface AcademicBackground {
  nivelAcademico: string;
  periodo: string;
  institucion: string;
  tituloOtorgado: string;
  evidencia: string;
}

@Component({
  selector: 'app-academic-background',
  standalone: true,
  imports: [MatButton, MatTableModule, MatIcon],
  templateUrl: './academic-background.component.html',
  styleUrls: ['./academic-background.component.scss'],
})
export class AcademicBackgroundComponent {
  displayedColumns: string[] = [
    'nivelAcademico',
    'periodo',
    'institucion',
    'tituloOtorgado',
    'evidencia',
    'eliminar',
  ];

  dataSource: AcademicBackground[] = [
    {
      nivelAcademico: 'Licenciatura',
      periodo: '2010-2014',
      institucion: 'Universidad X',
      tituloOtorgado: 'Ingeniero',
      evidencia: 'Ver',
    },
  ];

  constructor(private dialog: MatDialog) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(EvidenceDialogComponent, {
      width: '40%',
      disableClose: true,
    });

    dialogRef
      .afterClosed()
      .subscribe((result: AcademicBackground | undefined) => {
        if (result) {
          this.dataSource = [...this.dataSource, result];
        }
      });
  }

  eliminarEvidencia(element: AcademicBackground): void {
    this.dataSource = this.dataSource.filter((e) => e !== element);
  }
}
