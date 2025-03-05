import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-diploma-documentation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
  ],
  template: `
    <div class="dialog-container p-4 flex flex-col h-full">
      <div class="text-center">
        <h2 mat-dialog-title class="text-2xl font-bold text-black-800">
          <span class="font-bold">Documentación</span><br />
          <span class="font-medium text-rose-700">{{ data.diplomaKey }}</span>
        </h2>
      </div>

      <mat-dialog-content>
        <table mat-table [dataSource]="data.documentation" class="w-full">
          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Nombre del documento</th>
            <td mat-cell *matCellDef="let doc">{{ doc.name }}</td>
          </ng-container>

          <!-- File Column -->
          <ng-container matColumnDef="file">
            <th mat-header-cell *matHeaderCellDef>Archivo</th>
            <td mat-cell *matCellDef="let doc" class="text-center">
              <ng-container *ngIf="doc.filePath">
                <a [href]="doc.filePath" target="_blank">
                  <mat-icon class="hover-blue cursor-pointer"
                    >description</mat-icon
                  >
                </a>
              </ng-container>
              <ng-container *ngIf="!doc.filePath">
                <mat-icon class="text-gray-400">block</mat-icon>
              </ng-container>
            </td>
          </ng-container>

          <!-- Date Column -->
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Fecha de carga</th>
            <td mat-cell *matCellDef="let doc">
              {{ doc.uploadedAt | date : 'short' }}
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
      </mat-dialog-content>

      <div class="mb-2">
        <mat-dialog-actions class="mt-4 pb-2 w-full flex justify-end">
          <button
            mat-flat-button
            color="primary"
            mat-dialog-close
            class="w-full"
          >
            Cerrar
          </button>
        </mat-dialog-actions>
      </div>
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

      .mat-column-file,
      .mat-column-date {
        flex: 1;
        justify-content: center;
        text-align: center;
      }

      .hover-blue {
        transition: color 0.3s ease;
        &:hover {
          color: #1976d2;
        }
      }

      mat-icon {
        font-size: 24px;
      }
    `,
  ],
})
export class DiplomaDocumentationDialogComponent {
  displayedColumns: string[] = ['name', 'file', 'date'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
