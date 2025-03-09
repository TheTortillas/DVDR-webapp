import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface MessageResponse {
  statusCode: number;
  message: string;
}

export interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  sentAt: string;
  attended: boolean;
  attendedAt: string | null;
  attendedByName: string | null;
}

export interface MessageUpdate {
  id: number;
  attended: boolean;
  attendedBy: string;
}

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private URLBase = environment.apiUrl;
  private messageStatusChanged = new Subject<void>();
  messageStatusChanged$ = this.messageStatusChanged.asObservable();

  constructor(private httpClient: HttpClient) {}

  sendMessage(message: ContactMessage): Observable<MessageResponse> {
    const url = `${this.URLBase}/api/Messages/SentContactUsMessage`;
    return this.httpClient.post<MessageResponse>(url, message);
  }

  getAllMessages(): Observable<Message[]> {
    const url = `${this.URLBase}/api/Messages/GetAllContactUsMessages`;
    return this.httpClient.get<Message[]>(url);
  }

  updateMessageStatus(update: MessageUpdate): Observable<any> {
    const url = `${this.URLBase}/api/Messages/${update.id}/status`;
    return this.httpClient.put(url, update).pipe(
      tap(() => {
        // Emitir evento cuando se actualiza un mensaje
        this.messageStatusChanged.next();
      })
    );
  }
}
