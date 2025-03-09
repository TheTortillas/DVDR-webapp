import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { Message } from '../../../core/services/messages.service';
import { MessagesService } from '../../../core/services/messages.service';
import Swal from 'sweetalert2';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatListModule,
    MatDividerModule,
    MatSelectModule,
  ],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
})
export class MessagesComponent implements OnInit {
  messages: Message[] = [];
  filteredMessages: Message[] = [];
  selectedMessage: Message | null = null;

  // Control del filtro
  selectedTimeFilter: string = 'all';

  constructor(
    private messagesService: MessagesService,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    this.messagesService.getAllMessages().subscribe({
      next: (messages) => {
        // Guardamos todos los mensajes y también una copia para filtrar
        this.messages = messages.sort(
          (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
        );
        this.applyTimeFilter();
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los mensajes',
          icon: 'error',
        });
      },
    });
  }

  selectMessage(message: Message) {
    this.selectedMessage = message;
  }

  toggleAttended(message: Message) {
    const token = this.storageService.getItem('token');
    const claims = this.storageService.getTokenClaims(token!);

    const update = {
      id: message.id,
      attended: !message.attended,
      attendedBy: claims?.username || '',
    };

    this.messagesService.updateMessageStatus(update).subscribe({
      next: () => {
        message.attended = !message.attended;
        this.loadMessages(); // Recargar para actualizar contadores
      },
      error: (error) => {
        console.error('Error updating message:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo actualizar el estado del mensaje',
          icon: 'error',
        });
      },
    });
  }

  applyTimeFilter() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // base 0

    if (this.selectedTimeFilter === 'month') {
      this.filteredMessages = this.messages.filter((msg) => {
        const sentDate = new Date(msg.sentAt);
        return (
          sentDate.getMonth() === currentMonth &&
          sentDate.getFullYear() === currentYear
        );
      });
    } else if (this.selectedTimeFilter === 'year') {
      this.filteredMessages = this.messages.filter((msg) => {
        const sentDate = new Date(msg.sentAt);
        return sentDate.getFullYear() === currentYear;
      });
    } else {
      // 'all' - mostrar todo
      this.filteredMessages = [...this.messages];
    }
  }
}
