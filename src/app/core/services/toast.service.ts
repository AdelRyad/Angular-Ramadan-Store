import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toast = signal<ToastMessage | null>(null);
  isClosing = signal<boolean>(false);
  private currentTimeout: any;

  show(message: string, type: 'success' | 'error' | 'info' = 'success', duration = 3000) {
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
    }
    this.isClosing.set(false);
    this.toast.set({ id: Date.now(), message, type, duration });

    this.currentTimeout = setTimeout(() => {
      this.close();
    }, duration);
  }

  close() {
    this.isClosing.set(true);
    setTimeout(() => {
      this.toast.set(null);
      this.isClosing.set(false);
    }, 300); // 300ms matches the CSS exit animation duration
  }
}
