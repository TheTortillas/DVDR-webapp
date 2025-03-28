import { Component, Inject, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { formatDate } from '@angular/common';
import { CourseSession } from '../../../../core/services/courses.service';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

registerLocaleData(localeEs);

@Component({
  selector: 'app-sessions-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
  providers: [
    MatDatepickerModule,
    provideNativeDateAdapter(),
    { provide: LOCALE_ID, useValue: 'es' }, // Agregar el provider para español
  ],
  templateUrl: './sessions-dialog.component.html',
  styleUrl: './sessions-dialog.component.scss',
})
export class SessionsDialogComponent {
  displayedColumns = [
    'period',
    'participants',
    'certificates',
    'cost',
    'status',
    'createdAt',
  ];
  displayedColumnsWithExpand = [...this.displayedColumns, 'expand'];

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date
      .toLocaleString('es', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      })
      .toUpperCase(); // Para que AM/PM aparezca en mayúsculas
  }

  // Método para formatear el estado similar al de MyCoursesComponent
  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending':
        return 'En revisión';
      case 'opened':
        return 'Aperturado';
      case 'completed':
        return 'Completado';
      default:
        return 'Estado desconocido';
    }
  }

  // Método para determinar la clase CSS según el estado
  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'opened':
        return 'status-opened';
      case 'completed':
        return 'status-completed';
      default:
        return '';
    }
  }

  expandedElement: CourseSession | null = null;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      courseKey: string;
      sessions: CourseSession[];
    }
  ) {}
}
