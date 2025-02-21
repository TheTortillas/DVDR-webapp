import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataService, Center } from '../../../core/services/data.service';
import { AddCenterDialogComponent } from './add-center-dialog/add-center-dialog.component';

@Component({
  selector: 'app-centers',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './centers.component.html',
  styleUrls: ['./centers.component.scss'],
})
export class CentersComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'type', 'identifier'];
  dataSource: MatTableDataSource<Center>;
  centerTypes = ['CITTA', 'CVDR', 'UA'];
  selectedType: string = '';
  nameFilter: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dataService: DataService, private dialog: MatDialog) {
    this.dataSource = new MatTableDataSource<Center>([]);
  }

  ngOnInit(): void {
    this.loadCenters();
    this.dataSource.filterPredicate = (data: Center, filter: string) => {
      const searchStr = JSON.parse(filter);
      const matchesType =
        !searchStr.type ||
        data.type.toLowerCase() === searchStr.type.toLowerCase();
      const matchesName =
        !searchStr.name ||
        data.name.toLowerCase().includes(searchStr.name.toLowerCase());
      return matchesType && matchesName;
    };
  }

  loadCenters(): void {
    this.dataService.getCentersList().subscribe({
      next: (centers) => {
        this.dataSource.data = centers;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (error) => console.error('Error loading centers:', error),
    });
  }

  applyFilter(event: Event): void {
    this.nameFilter = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.applyFilters();
  }

  filterByType(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    const filterValue = JSON.stringify({
      type: this.selectedType,
      name: this.nameFilter,
    });
    this.dataSource.filter = filterValue;
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddCenterDialogComponent, {
      width: '40%',
      height: '50%',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadCenters();
      }
    });
  }
}
