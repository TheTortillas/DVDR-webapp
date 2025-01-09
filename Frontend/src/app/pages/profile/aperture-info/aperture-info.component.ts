import { Component, inject } from '@angular/core';
import { ScheduleDialogComponent } from '../../../shared/components/schedule-dialog/schedule-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatDivider } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-aperture-info',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDivider,
    MatRadioModule,
    MatIcon,
    MatButtonModule,
  ],
  templateUrl: './aperture-info.component.html',
  styleUrl: './aperture-info.component.scss',
})
export class ApertureInfoComponent {
  //-------------------------------------- DIALOG CRONOGRAMA  ---------------------------------------
  readonly dialog = inject(MatDialog);

  title = '';
  clave = '';

  constructor(private route: ActivatedRoute) {
    this.route.queryParams.subscribe((params) => {
      this.title = params['title'] || '';
      this.clave = params['clave'] || '';
    });
  }

  openDialog(
    enterAnimationDuration: string,
    exitAnimationDuration: string
  ): void {
    this.dialog.open(ScheduleDialogComponent, {
      width: '90%',
      height: '80%',
      disableClose: true,
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
}
