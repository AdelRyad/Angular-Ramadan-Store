import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  isLoading = signal<Boolean>(false);
  show() {
    this.isLoading.set(true);
  }
  hide() {
    this.isLoading.set(false);
  }
}
