import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { PLATFORM_ID } from '@angular/core';

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;

  const mockRouter = {
    navigate: vi.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login correctly', () => {
    const loginResult = service.login('testuser', 'admin');
    expect(loginResult).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.userRole()).toBe('admin');
    expect(service.currentUser()?.username).toBe('testuser');
  });

  it('should logout correctly', () => {
    service.login('testuser', 'admin');
    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.userRole()).toBe('visitor');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should return initial user from localStorage if exists', () => {
    const user = { username: 'stored', role: 'shopper' };
    localStorage.setItem('user', JSON.stringify(user));

    // Create new instance within injection context so inject(...) calls work
    const newService = TestBed.runInInjectionContext(() => new AuthService(router as any));
    expect(newService.isAuthenticated()).toBe(true);
    expect(newService.userRole()).toBe('shopper');
  });
});
