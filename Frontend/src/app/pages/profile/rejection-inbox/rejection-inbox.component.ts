import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import {
  RejectionMessagesService,
  RejectionMessageDTO,
} from '../../../core/services/rejection-messages.service';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-rejection-inbox',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatBadgeModule,
  ],
  templateUrl: './rejection-inbox.component.html',
  styleUrls: ['./rejection-inbox.component.scss'],
})
export class RejectionInboxComponent implements OnInit {
  messages: RejectionMessageDTO[] = [];
  loading = true;
  error = false;
  username: string = '';

  constructor(
    private rejectionMessagesService: RejectionMessagesService,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    const token = this.storageService.getItem('token');
    if (token) {
      const claims = this.storageService.getTokenClaims(token);
      if (claims && claims.username) {
        this.username = claims.username;
        this.loadMessages();
      }
    }
  }

  loadMessages() {
    this.loading = true;
    this.error = false;

    this.rejectionMessagesService
      .getUserRejectionMessages(this.username)
      .subscribe({
        next: (data) => {
          this.messages = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching rejection messages:', error);
          this.error = true;
          this.loading = false;
        },
      });
  }

  markAsRead(message: RejectionMessageDTO) {
    if (!message.readStatus) {
      this.rejectionMessagesService.markMessageAsRead(message.id).subscribe({
        next: () => {
          message.readStatus = true;
          message.readAt = new Date();
        },
        error: (error) => {
          console.error('Error marking message as read:', error);
        },
      });
    }
  }

  refreshMessages() {
    this.loadMessages();
  }

  getRejectionTypeLabel(type: string): string {
    const types = {
      course_registration: 'Registro de Curso',
      diploma_registration: 'Registro de Diplomado',
      course_opening: 'Apertura de Curso',
      course_certificates: 'Certificados de Curso',
      diploma_certificates: 'Certificados de Diplomado',
    };
    return types[type as keyof typeof types] || type;
  }
}
