import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (typeof window === 'undefined') {
    return true; // Bypass on server to prevent 302 redirects
  }

  if (authService.isAuthenticated()) {
    router.navigate(['/']);
    return false;
  }
  return true;
};
