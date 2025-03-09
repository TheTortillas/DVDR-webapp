import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private URLBase = environment.apiUrl;

  constructor(private httpClient: HttpClient) {}

  sendMessage(message: ContactMessage): Observable<MessageResponse> {
    const url = `${this.URLBase}/api/Messages`;
    return this.httpClient.post<MessageResponse>(url, message);
  }
}
