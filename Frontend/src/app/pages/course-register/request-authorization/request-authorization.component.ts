import { Component, inject } from '@angular/core';
import { ScheduleDialogComponent } from '../../../components/schedule-dialog/schedule-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { MatDivider } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-request-authorization',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, RouterLink, MatDivider, MatRadioModule, MatIcon, MatButtonModule],
  templateUrl: './request-authorization.component.html',
  styleUrl: './request-authorization.component.scss'
})
export class RequestAuthorizationComponent {

//-------------------------------------- DIALOG CRONOGRAMA  ---------------------------------------
readonly dialog = inject(MatDialog);

  constructor(){  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(ScheduleDialogComponent, {
      width: '90%',
      height: '80%',
      disableClose:true,
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
}
