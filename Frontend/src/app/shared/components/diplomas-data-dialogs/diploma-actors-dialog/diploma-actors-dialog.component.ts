import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-diploma-actors-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatTableModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6 text-center">
        Actores del Diplomado {{ data.diplomaKey }}
      </h2>

      <table mat-table [dataSource]="data.actors" class="w-full">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Nombre</th>
          <td mat-cell *matCellDef="let actor">{{ actor.name }}</td>
        </ng-container>

        <ng-container matColumnDef="role">
          <th mat-header-cell *matHeaderCellDef>Rol</th>
          <td mat-cell *matCellDef="let actor">{{ actor.role }}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="['name', 'role']"></tr>
        <tr mat-row *matRowDef="let row; columns: ['name', 'role']"></tr>
      </table>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        max-height: 90vh;
        overflow-y: auto;
      }

      .mat-column-name {
        flex: 2;
      }

      .mat-column-role {
        flex: 1;
      }
    `,
  ],
})
export class DiplomaActorsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
