// src/app/core/services/aperture-state.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

interface CourseInfo {
  id: number;
  title: string;
  clave: string;
  totalDuration: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApertureStateService {
  private selectedCourse: CourseInfo | null = null;

  constructor(private router: Router) {}

  setCourseInfo(course: CourseInfo) {
    this.selectedCourse = course;
  }

  getCourseInfo(): CourseInfo | null {
    return this.selectedCourse;
  }

  clearCourseInfo() {
    this.selectedCourse = null;
  }

  validateAccess(): boolean {
    if (!this.selectedCourse) {
      this.router.navigate(['/profile/request-aperture']);
      return false;
    }
    return true;
  }
}
