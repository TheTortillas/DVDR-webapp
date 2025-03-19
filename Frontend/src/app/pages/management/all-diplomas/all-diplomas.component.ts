import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DiplomasService } from '../../../core/services/diplomas.service';
import { DiplomaGeneralInfoDialogComponent } from '../../../shared/components/diplomas-data-dialogs/diploma-general-info-dialog/diploma-general-info-dialog.component';
import { DiplomaActorsDialogComponent } from '../../../shared/components/diplomas-data-dialogs/diploma-actors-dialog/diploma-actors-dialog.component';
import { DiplomaDocumentationDialogComponent } from '../../../shared/components/diplomas-data-dialogs/diploma-documentation-dialog/diploma-documentation-dialog.component';
import { ReportsService } from '../../../core/services/reports.service';
import Swal from 'sweetalert2';

interface DiplomaActor {
  actorId: number;
  name: string;
  role: string;
}

interface DiplomaDocument {
  documentId: number;
  name: string;
  filePath: string | null;
  uploadedAt: Date;
}

interface DiplomaData {
  diplomaId: number;
  name: string;
  totalDuration: number;
  diplomaKey: string;
  serviceType: string;
  modality: string;
  educationalOffer: string;
  status: string;
  approvalStatus: string;
  cost: number;
  participants: number;
  startDate: Date;
  endDate: Date;
  expirationDate: Date;
  center: string;
  registeredBy: string;
  actors: DiplomaActor[];
  documentation: DiplomaDocument[];
}

@Component({
  selector: 'app-all-diplomas',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './all-diplomas.component.html',
  styleUrl: './all-diplomas.component.scss',
})
export class AllDiplomasComponent implements OnInit {
  displayedColumns: string[] = [
    'name',
    'diplomaKey',
    'center',
    'generalInfo',
    'actors',
    'documentation',
  ];

  // Variables para los filtros
  searchText: string = '';
  selectedCenter: string = '';
  centers: string[] = [];

  dataSource: MatTableDataSource<DiplomaData> =
    new MatTableDataSource<DiplomaData>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private diplomasService: DiplomasService,
    private dialog: MatDialog,
    private reportsService: ReportsService
  ) {}

  ngOnInit() {
    this.loadAllDiplomas();
    this.loadCenters();
  }

  loadAllDiplomas() {
    this.diplomasService.getAllDiplomas().subscribe({
      next: (response: any) => {
        // Handle undefined or null response
        if (!response) {
          this.dataSource = new MatTableDataSource<DiplomaData>([]);
          this.dataSource.paginator = this.paginator;
          return;
        }

        // Handle both array and object with data property
        const diplomas = Array.isArray(response)
          ? response
          : response.data || [];

        // Filter approved diplomas
        const filteredDiplomas = diplomas.filter(
          (diploma: DiplomaData) => diploma.approvalStatus === 'approved'
        );

        this.dataSource = new MatTableDataSource<DiplomaData>(filteredDiplomas);
        this.dataSource.paginator = this.paginator;
        this.dataSource.filterPredicate = this.createFilter();
      },
      error: (error) => {
        console.error('Error al cargar diplomados:', error);
        this.dataSource = new MatTableDataSource<DiplomaData>([]);
        this.dataSource.paginator = this.paginator;
      },
    });
  }

  loadCenters() {
    this.diplomasService.getAllDiplomas().subscribe({
      next: (diplomas: DiplomaData[]) => {
        // Especificar el tipo de datos y usar type assertion para el Set
        this.centers = Array.from(
          new Set(diplomas.map((d: DiplomaData) => d.center))
        ) as string[];
      },
      error: (error) => {
        console.error('Error al cargar centros:', error);
      },
    });
  }

  createFilter(): (data: DiplomaData, filter: string) => boolean {
    return (data: DiplomaData, filter: string): boolean => {
      const searchStr = JSON.parse(filter);

      // Filtro por nombre
      const matchesName =
        !searchStr.name ||
        data.name.toLowerCase().includes(searchStr.name.toLowerCase());

      // Filtro por centro
      const matchesCenter =
        !searchStr.center ||
        data.center.toLowerCase() === searchStr.center.toLowerCase();

      return matchesName && matchesCenter;
    };
  }

  applyFilter() {
    const filterValue = JSON.stringify({
      name: this.searchText,
      center: this.selectedCenter,
    });

    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openGeneralInfoDialog(diplomaId: number) {
    const diploma = this.dataSource.data.find((d) => d.diplomaId === diplomaId);
    if (diploma) {
      this.dialog.open(DiplomaGeneralInfoDialogComponent, {
        width: '50%',
        height: '90%',
        maxWidth: '100vw',
        maxHeight: '100vh',
        autoFocus: false,
        data: diploma,
      });
    }
  }

  openActorsDialog(diplomaId: number) {
    const diploma = this.dataSource.data.find((d) => d.diplomaId === diplomaId);
    if (diploma) {
      this.dialog.open(DiplomaActorsDialogComponent, {
        width: '40%',
        height: '50%',
        maxWidth: '100vw',
        maxHeight: '100vh',
        autoFocus: false,
        data: {
          diplomaKey: diploma.diplomaKey,
          actors: diploma.actors,
        },
      });
    }
  }

  openDocumentationDialog(diplomaId: number) {
    const diploma = this.dataSource.data.find((d) => d.diplomaId === diplomaId);
    if (diploma) {
      this.dialog.open(DiplomaDocumentationDialogComponent, {
        width: '40%',
        height: '65%',
        maxWidth: '100vw',
        maxHeight: '100vh',
        autoFocus: false,
        data: {
          diplomaKey: diploma.diplomaKey,
          documentation: diploma.documentation,
        },
      });
    }
  }

  // Nuevo método para generar reporte de constancias entregadas
  generateCurrentDiplomasReport() {
    Swal.fire({
      title: 'Descargando reporte...',
      text: 'Se iniciará la descarga del reporte de diplomados vigentes.',
      icon: 'info',
      showConfirmButton: false,
      timer: 2000,
    });
    this.reportsService.downloadCurrentVigentDiplomasReport();
  }

  generateCertificatesDeliveredReport() {
    Swal.fire({
      title: 'Descargando reporte...',
      text: 'Se iniciará la descarga del reporte de constancias de diplomados entregadas.',
      icon: 'info',
      showConfirmButton: false,
      timer: 2000,
    });
    this.reportsService.downloadCertificatesDeliveredDiplomasReport();
  }
}
