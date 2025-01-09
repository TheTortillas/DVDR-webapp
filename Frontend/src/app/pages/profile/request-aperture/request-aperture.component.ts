import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-request-aperture',
  standalone: true,
  imports: [MatTableModule, MatButtonModule],
  templateUrl: './request-aperture.component.html',
  styleUrls: ['./request-aperture.component.scss'],
})
export class RequestApertureComponent {
  displayedColumns: string[] = ['no', 'title', 'clave', 'solicitar'];
  courses = [
    {
      title: 'Gerencia y liderazgo en enfermería',
      clave: 'DVDR/C/2504_1/2024-2026',
    },
    {
      title: 'Microservicios con .NET y kubernetes',
      clave: 'DVDR/C/2505_1/2024-2026',
    },
  ];
  dataSource = this.courses;

  constructor(private router: Router, private route: ActivatedRoute) {}

  solicitarApertura(course: { title: string }) {
    console.log(`Solicitud de apertura para el curso: ${course.title}`);
    this.router.navigate(['aperture-info'], { relativeTo: this.route });
  }
}
