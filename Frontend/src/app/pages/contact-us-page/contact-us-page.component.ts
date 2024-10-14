import { Component, OnInit} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {ChangeDetectionStrategy, signal} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDividerModule} from '@angular/material/divider';
import { environment } from '../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';



@Component({
  selector: 'app-contact-us-page',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule, MatDividerModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush, //Este no sé pa' qué es
  templateUrl: './contact-us-page.component.html',
  styleUrl: './contact-us-page.component.scss'
})
export class ContactUsPageComponent {
  googleMapsApiKey = environment.googleMapsApiKey;
  mapUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    const url = `https://www.google.com/maps/embed/v1/place?key=${this.googleMapsApiKey}&q=Dirección+de+Vinculación+y+Desarrollo+Regional+del+IPN+(antes+DEC),+Gustavo+A.+Madero,+CDMX`;
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    //console.log(this.googleMapsApiKey);
  }
}