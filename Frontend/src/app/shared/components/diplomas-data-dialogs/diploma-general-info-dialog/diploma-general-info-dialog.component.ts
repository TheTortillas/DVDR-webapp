import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-diploma-general-info-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6 text-center">
        Información General del Diplomado
      </h2>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="font-semibold">Nombre:</p>
          <p>{{ data.name }}</p>
        </div>
        <div>
          <p class="font-semibold">Clave:</p>
          <p>{{ data.diplomaKey }}</p>
        </div>
        <div>
          <p class="font-semibold">Duración total:</p>
          <p>{{ data.totalDuration }} horas</p>
        </div>
        <div>
          <p class="font-semibold">Modalidad:</p>
          <p>{{ data.modality }}</p>
        </div>
        <div>
          <p class="font-semibold">Tipo de servicio:</p>
          <p>{{ data.serviceType }}</p>
        </div>
        <div>
          <p class="font-semibold">Oferta educativa:</p>
          <p>{{ data.educationalOffer }}</p>
        </div>
        <div>
          <p class="font-semibold">Costo:</p>
          <p>{{ data.cost | currency }}</p>
        </div>
        <div>
          <p class="font-semibold">Participantes:</p>
          <p>{{ data.participants }}</p>
        </div>
        <div>
          <p class="font-semibold">Fecha de inicio:</p>
          <p>{{ data.startDate | date }}</p>
        </div>
        <div>
          <p class="font-semibold">Fecha de fin:</p>
          <p>{{ data.endDate | date }}</p>
        </div>
        <div>
          <p class="font-semibold">Fecha de expiración:</p>
          <p>{{ data.expirationDate | date }}</p>
        </div>
        <div>
          <p class="font-semibold">Centro:</p>
          <p>{{ data.center }}</p>
        </div>
        <div>
          <p class="font-semibold">Registrado por:</p>
          <p>{{ data.registeredBy }}</p>
        </div>
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
    `,
  ],
})
export class DiplomaGeneralInfoDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
