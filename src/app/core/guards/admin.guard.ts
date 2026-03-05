import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  if (typeof window === 'undefined') {
    return true; // SSR bypass
  }

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (authService.userRole() === 'admin') {
    return true;
  }

  // Authenticated but not admin — show error and redirect to products
  toastService.show('ERR_FORBIDDEN', 'error');
  router.navigate(['/products']);
  return false;
};
