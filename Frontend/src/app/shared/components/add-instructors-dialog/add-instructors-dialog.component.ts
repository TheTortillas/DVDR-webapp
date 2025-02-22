import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { DataService } from '../../../core/services/data.service';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { StorageService } from '../../../core/services/storage.service';

interface Instructor {
  id: number;
  nombre: string;
  centro: string;
  areasExpertise: string[];
}

@Component({
  selector: 'app-add-instructors-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatCheckboxModule,
    MatIcon,
    MatDivider,
    MatPaginatorModule,
  ],
  templateUrl: './add-instructors-dialog.component.html',
  styleUrl: './add-instructors-dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AddInstructorsDialogComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['select', 'nombre', 'areasExpertise', 'centro'];
  dataSource!: MatTableDataSource<Instructor>;
  selection = new SelectionModel<Instructor>(true, []);

  // Variables de filtros
  searchText: string = '';
  selectedArea: string = '';
  selectedAreas: string[] = [];
  selectedCenter: string = '';

  // Se llenará con la data del servicio
  areasExpertise: string[] = [];
  instructores: Instructor[] = [];
  centers: string[] = [];
  selectedCenters: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<AddInstructorsDialogComponent>,
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    // Carga de centros
    // this.dataService.getCenters().subscribe((res: string[]) => {
    //   this.centers = res;
    // });

    const token = this.storageService.getItem('token');
    let userCenter = '';
    if (token) {
      const claims = this.storageService.getTokenClaims(token);
      if (claims && claims.center) {
        userCenter = claims.center;
      }
    }

    // Carga de áreas
    this.dataService.getExpertiseAreas().subscribe((areas: string[]) => {
      this.areasExpertise = areas;
    });

    // Carga de instructores, filtrando por el centro del token
    this.dataService.getInstructors().subscribe((instructors: Instructor[]) => {
      // Filtra a instructores del mismo centro
      this.instructores = instructors.filter(
        (inst) => inst.centro === userCenter
      );
      this.dataSource = new MatTableDataSource(this.instructores);
      this.dataSource.paginator = this.paginator;
    });
  }

  applyFilter() {
    let filteredData = this.instructores;

    // Filtrar por texto de búsqueda
    if (this.searchText.trim()) {
      filteredData = filteredData.filter((inst) =>
        inst.nombre.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    // Filtrar por áreas seleccionadas
    if (this.selectedAreas && this.selectedAreas.length > 0) {
      filteredData = filteredData.filter((inst) =>
        this.selectedAreas.every((area) => inst.areasExpertise.includes(area))
      );
    }

    // // Filtrar por centro
    // if (this.selectedCenter.trim()) {
    //   filteredData = filteredData.filter(
    //     (inst) => inst.centro === this.selectedCenter
    //   );
    // }

    // // Filtrar por centros múltiples
    // if (this.selectedCenters.length > 0) {
    //   filteredData = filteredData.filter((inst) =>
    //     this.selectedCenters.includes(inst.centro)
    //   );
    // }

    this.dataSource.data = filteredData;

    // Reiniciar el paginador a la primera página cuando se aplica un filtro
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  addInstructors() {
    this.dialogRef.close(this.selection.selected);
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
