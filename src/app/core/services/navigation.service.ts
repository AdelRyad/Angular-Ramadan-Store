import { inject, Injectable, signal, PLATFORM_ID, effect } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private doc = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  isMobileMenuOpen = signal(false);
  screenWidth = signal(0);
  private mobileBreakpoint = 900;

  constructor() {
    if (this.isBrowser) {
      this.updateWidth();
      window.addEventListener('resize', () => this.updateWidth());

      // Auto-close mobile menu on resize to desktop
      effect(() => {
        if (this.screenWidth() > this.mobileBreakpoint && this.isMobileMenuOpen()) {
          this.closeMobileMenu();
        }
      });
    }
  }

  private updateWidth() {
    this.screenWidth.set(window.innerWidth);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update((v) => !v);
    this.syncBodyScroll(this.isMobileMenuOpen());
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
    this.syncBodyScroll(false);
  }

  private syncBodyScroll(lock: boolean) {
    if (this.isBrowser) {
      this.doc.body.style.overflow = lock ? 'hidden' : '';
    }
  }
}
