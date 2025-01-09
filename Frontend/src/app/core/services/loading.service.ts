import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private contador = 0;
  private _isLoading = false;

  constructor() {}

  showLoading() {
    this.contador++;
    this._isLoading = true;
  }

  hideLoading() {
    if (this.contador > 0) {
      this.contador--;
    }
    if (this.contador === 0) {
      this._isLoading = false;
    }
  }

  get isLoading(): boolean {
    return this._isLoading;
  }
}
