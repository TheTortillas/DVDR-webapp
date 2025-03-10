import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { InstructorRegisterService } from '../../../core/services/instructor-register.service';
import { Instructor } from '../../../core/services/instructor-register.service';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-instructors',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
  ],
  templateUrl: './instructors.component.html',
  styleUrl: './instructors.component.scss',
})
export class InstructorsComponent implements OnInit {
  instructors: Instructor[] = [];
  filteredInstructors: Instructor[] = [];
  centers: string[] = [];

  // Variables para los filtros
  searchText: string = '';
  selectedCenter: string = '';

  //loading = true;
  error = false;

  constructor(
    private instructorService: InstructorRegisterService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadInstructors();
  }

  private loadInstructors() {
    this.instructorService.getAllInstructors().subscribe({
      next: (data) => {
        this.instructors = data;
        this.filteredInstructors = data;
        this.centers = Array.from(
          new Set(data.map((instructor) => instructor.centerName))
        ).sort();
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading instructors:', error);
        this.error = true;
      },
    });
  }

  applyFilters() {
    this.filteredInstructors = this.instructors.filter((instructor) => {
      const matchesName =
        this.searchText === '' ||
        instructor.firstName
          .toLowerCase()
          .includes(this.searchText.toLowerCase()) ||
        instructor.lastName
          .toLowerCase()
          .includes(this.searchText.toLowerCase()) ||
        (instructor.secondLastName?.toLowerCase() || '').includes(
          this.searchText.toLowerCase()
        );

      const matchesCenter =
        this.selectedCenter === '' ||
        instructor.centerName === this.selectedCenter;

      return matchesName && matchesCenter;
    });
  }
}
