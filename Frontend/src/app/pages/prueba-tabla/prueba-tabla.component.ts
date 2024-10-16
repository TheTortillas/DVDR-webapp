import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {provideNativeDateAdapter} from '@angular/material/core';
import { MatNativeDateModule } from '@angular/material/core';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-prueba-tabla',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, FormsModule, ReactiveFormsModule],
  templateUrl: './prueba-tabla.component.html',
  styleUrl: './prueba-tabla.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PruebaTablaComponent {
 
//-------------------------------------- CRONOGRAMA  ---------------------------------------
   
cronograma = new FormGroup({
  fechaInicio: new FormControl('', Validators.required),
  fechaFin: new FormControl('', Validators.required),
  horasTotales: new FormControl('', [Validators.required, Validators.min(1)]),
  horaInicio: new FormControl('', Validators.required),
  horaFin: new FormControl('', Validators.required),
  dias: new FormGroup({
    lunes: new FormControl(false),
    martes: new FormControl(false),
    miercoles: new FormControl(false),
    jueves: new FormControl(false),
    viernes: new FormControl(false),
    sabado: new FormControl(false),
    domingo: new FormControl(false),
  })
});

// Evento para actualizar fecha y forzar la detección de cambios
onFechaChange(controlName: string, event: any) {
const fecha = event.target.value;
this.cronograma.get(controlName)?.setValue(fecha);
this.cronograma.get(controlName)?.updateValueAndValidity();  // Forzar detección de cambios
}

generarCronograma() {
  const formValues = this.cronograma.value;
  console.log(formValues);

  // Ahora puedes usar estas variables en tu lógica
  const fechaInicio = formValues.fechaInicio;
  const fechaFin = formValues.fechaFin;
  const horasTotales = formValues.horasTotales;
  const horaInicio = formValues.horaInicio;
  const horaFin = formValues.horaFin;
  const diasSeleccionados = formValues.dias;

  console.log(fechaInicio, fechaFin, horasTotales, horaInicio, horaFin, diasSeleccionados);
}

}