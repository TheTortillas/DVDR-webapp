import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

interface ApertureInfo {
  id: number;
  title: string;
  clave: string;
  totalDuration: number;
  expirationDate?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApertureStateService {
  private selectedAperture: ApertureInfo | null = null;

  constructor(private router: Router) {}

  setApertureInfo(Aperture: ApertureInfo) {
    this.selectedAperture = Aperture;
  }

  getApertureInfo(): ApertureInfo | null {
    return this.selectedAperture;
  }

  clearApertureInfo() {
    this.selectedAperture = null;
  }

  validateAccess(): boolean {
    if (!this.selectedAperture) {
      this.router.navigate(['/profile/request-aperture']);
      return false;
    }
    return true;
  }
}
