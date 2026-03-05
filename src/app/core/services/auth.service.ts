import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { User, Role } from '../models/user.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Signal to hold the current user state
  private currentUserSignal = signal<User | null>(this.getStoredUser());

  // Computed signals
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly userRole = computed(() => this.currentUserSignal()?.role || 'visitor');

  private router = inject(Router);

  login(username: string, role: Role): boolean {
    const user: User = { username, role };
    this.currentUserSignal.set(user);
    if (this.isBrowser) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    return true;
  }

  logout() {
    this.currentUserSignal.set(null);
    if (this.isBrowser) {
      localStorage.removeItem('user');
    }
    this.router.navigate(['/login']);
  }

  private getStoredUser(): User | null {
    if (!this.isBrowser) return null;
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  }
}
