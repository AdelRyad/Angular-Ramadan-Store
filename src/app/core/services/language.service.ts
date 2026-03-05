import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private http = inject(HttpClient);

  currentLang = signal<'en' | 'ar'>(
    (this.isBrowser && (localStorage.getItem('lang') as 'en' | 'ar')) || 'en',
  );
  translations = signal<any>({});

  constructor() {
    effect(() => {
      const lang = this.currentLang();
      if (this.isBrowser) {
        localStorage.setItem('lang', lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      }
      this.loadTranslation(lang);
    });
  }

  private loadTranslation(lang: string) {
    this.http.get(`./i18n/${lang}.json`).subscribe((data) => this.translations.set(data));
  }

  translate(key: string): string {
    return this.translations()[key] || key;
  }

  setLanguage(lang: 'en' | 'ar') {
    this.currentLang.set(lang);
  }
}
