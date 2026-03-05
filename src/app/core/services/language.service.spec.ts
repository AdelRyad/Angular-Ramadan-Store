import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LanguageService } from './language.service';
import { PLATFORM_ID } from '@angular/core';

describe('LanguageService', () => {
  let service: LanguageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        LanguageService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    service = TestBed.inject(LanguageService);
    httpMock = TestBed.inject(HttpTestingController);

    // Consume initial request
    httpMock.match('./i18n/en.json').forEach((req) => req.flush({}));
  });

  afterEach(() => {
    httpMock.match(() => true).forEach((req) => req.flush({}));
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should change language and update localStorage', async () => {
    service.setLanguage('ar');
    await new Promise((r) => setTimeout(r, 0));
    expect(service.currentLang()).toBe('ar');
    expect(localStorage.getItem('lang')).toBe('ar');
  });

  it('should load translations for specified language', async () => {
    service.setLanguage('ar');
    await new Promise((r) => setTimeout(r, 0));

    const req = httpMock.expectOne('./i18n/ar.json');
    req.flush({ HELLO: 'Marhaba' });
    expect(service.translate('HELLO')).toBe('Marhaba');
  });
});
