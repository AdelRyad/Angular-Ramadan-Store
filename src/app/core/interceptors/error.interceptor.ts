import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'ERR_UNKNOWN';

      if (isBrowser && !navigator.onLine) {
        message = 'ERR_OFFLINE';
      } else if (error.status === 0) {
        // Network error or CORS
        message = 'ERR_NETWORK';
      } else if (error.status === 404) {
        message = 'ERR_NOT_FOUND';
      } else if (error.status === 401) {
        message = 'ERR_UNAUTHORIZED';
      } else if (error.status === 403) {
        message = 'ERR_FORBIDDEN';
      } else if (error.status >= 500) {
        message = 'ERR_SERVER';
      } else if (error.error?.message) {
        message = error.error.message;
      }
      // just for testing vercel output chagne
      if (isBrowser) {
        toastService.show(message, 'error', 5000);
      }
      return throwError(() => error);
    }),
  );
};
