import { Component, EventEmitter, inject, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EvidenceDialogComponent } from '../../../../shared/components/evidence-dialog/evidence-dialog.component';
import { MatButton } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

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
  imports: [MatButton, MatTableModule, MatIcon, MatTooltip],
  templateUrl: './academic-background.component.html',
  styleUrls: ['./academic-background.component.scss'],
})
export class AcademicBackgroundComponent {
  @Output() dataSourceChange = new EventEmitter<boolean>();

  displayedColumns: string[] = [
    'nivelAcademico',
    'periodo',
    'institucion',
    'tituloOtorgado',
    'evidencia',
    'eliminar',
  ];

  dataSource: AcademicBackground[] = [];

  constructor(private dialog: MatDialog) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(EvidenceDialogComponent, {
      autoFocus: false,
      width: '40%',
    });

    dialogRef
      .afterClosed()
      .subscribe((result: AcademicBackground | undefined) => {
        if (result) {
          this.dataSource = [...this.dataSource, result];
          this.dataSourceChange.emit(this.dataSource.length > 0);
        }
      });
  }

  verEvidencia(element: AcademicBackground): void {
    // Abre la URL del archivo en una nueva ventana
    window.open(element.evidencia, '_blank');
  }

  eliminarEvidencia(element: AcademicBackground): void {
    this.dataSource = this.dataSource.filter((e) => e !== element);
    this.dataSourceChange.emit(this.dataSource.length > 0);
  }
}
