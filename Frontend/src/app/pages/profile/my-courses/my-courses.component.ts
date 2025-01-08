import { Component, OnInit, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

interface Course {
  title: string;
  dataSource: {
    no: number;
    clave: string;
    periodo: string;
    participantes: number;
    constancias: number;
    estatus: string;
  }[];
}

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [MatExpansionModule, MatTableModule, CommonModule, MatTooltipModule],
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.scss'],
})
export class MyCoursesComponent implements OnInit {
  readonly panelOpenState = signal(false);
  displayedColumns: string[] = [
    'no',
    'clave',
    'periodo',
    'participantes',
    'constancias',
    'estatus',
  ];
  courses: Course[] = [];

  ngOnInit() {
    this.courses = [
      {
        title: 'Gerencia y liderazgo en enfermería',
        dataSource: [
          {
            no: 1,
            clave: 'DVDR/C/2504_1/2024-2026',
            periodo: 'ENE2024-MAR2024',
            participantes: 30,
            constancias: 15,
            estatus: 'Aperturado',
          },
          {
            no: 2,
            clave: 'DVDR/C/2504_2/2024-2026',
            periodo: 'ABR2024-MAY2024',
            participantes: 25,
            constancias: 13,
            estatus: 'Concluido',
          },
        ],
      },
      {
        title: 'Microservicios con .NET y kubernetes',
        dataSource: [
          {
            no: 1,
            clave: 'DVDR/C/2505_1/2024-2026',
            periodo: 'ENE2024-MAR2024',
            participantes: 28,
            constancias: 14,
            estatus: 'En espera',
          },
          {
            no: 2,
            clave: 'DVDR/C/2505_2/2024-2026',
            periodo: 'ABR2024-MAY2024',
            participantes: 32,
            constancias: 20,
            estatus: 'Aperturado',
          },
          {
            no: 3,
            clave: 'DVDR/C/2505_3/2024-2026',
            periodo: 'AGO2024-DIC2024',
            participantes: 29,
            constancias: 15,
            estatus: 'Concluido',
          },
        ],
      },
    ];
  }
}
