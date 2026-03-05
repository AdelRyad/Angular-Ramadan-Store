import { TestBed } from '@angular/core/testing';
import { TranslatePipe } from './translate.pipe';
import { LanguageService } from '../../core/services/language.service';
import { signal } from '@angular/core';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;
  let langServiceMock: Partial<LanguageService>;

  beforeEach(() => {
    langServiceMock = {
      translate: (key: string) => (key === 'HELLO' ? 'Hello' : key),
      currentLang: signal('en' as const),
    };

    TestBed.configureTestingModule({
      providers: [TranslatePipe, { provide: LanguageService, useValue: langServiceMock }],
    });

    pipe = TestBed.inject(TranslatePipe);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should translate a key using LanguageService', () => {
    expect(pipe.transform('HELLO')).toBe('Hello');
  });

  it('should return the key itself if no translation found', () => {
    expect(pipe.transform('UNKNOWN')).toBe('UNKNOWN');
  });
});
