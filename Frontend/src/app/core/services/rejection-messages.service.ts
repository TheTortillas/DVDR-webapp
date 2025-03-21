import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface RejectionMessageDTO {
  id: number;
  userName: string;
  userId: number;
  centerName: string;
  rejectionType: string;
  subject: string;
  adminNotes: string;
  verificationNotes: string;
  createdAt: Date;
  readStatus: boolean;
  readAt: Date | null;
}

@Injectable({
  providedIn: 'root',
})
export class RejectionMessagesService {
  private URLBase = environment.apiUrl;
  private messageStatusChangedSource = new Subject<void>();

  // Observable que otros componentes pueden suscribirse para detectar cambios en mensajes
  messageStatusChanged$ = this.messageStatusChangedSource.asObservable();

  constructor(private httpClient: HttpClient) {}

  // Obtener mensajes de rechazo para el usuario actual
  getUserRejectionMessages(
    username: string
  ): Observable<RejectionMessageDTO[]> {
    const url = `${this.URLBase}/api/RejectionMessages/GetUserRejectionMessages?username=${username}`;
    return this.httpClient.get<RejectionMessageDTO[]>(url);
  }

  // Marcar un mensaje de rechazo como leído
  markMessageAsRead(messageId: number): Observable<any> {
    const url = `${this.URLBase}/api/RejectionMessages/${messageId}/read`;
    return this.httpClient.put(url, {}).pipe(
      tap(() => {
        // Notificar a los suscriptores que el estado de un mensaje ha cambiado
        this.messageStatusChangedSource.next();
      })
    );
  }

  // Obtener conteo de mensajes no leídos
  getUnreadMessagesCount(username: string): Observable<number> {
    const url = `${this.URLBase}/api/RejectionMessages/GetUnreadMessagesCount?username=${username}`;
    return this.httpClient.get<number>(url);
  }
}
