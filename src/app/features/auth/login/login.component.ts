import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LanguageService } from '../../../core/services/language.service';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, TranslatePipe, InputComponent, ButtonComponent, NgOptimizedImage],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  protected langService = inject(LanguageService);

  errorMessage = signal<string | null>(null);

  loginForm = this.fb.group({
    username: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
    password: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
  });

  toggleLanguage() {
    const nextLang = this.langService.currentLang() === 'en' ? 'ar' : 'en';
    this.langService.setLanguage(nextLang);
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value as { username: string; password: string };

      if (username === 'admin' && password === 'admin') {
        this.authService.login(username, 'admin');
        this.router.navigate(['/admin']);
      } else if (username === 'user' && password === 'user') {
        this.authService.login(username, 'user');
        this.router.navigate(['/products']);
      } else {
        this.errorMessage.set('INVALID_CREDENTIALS');
      }
    }
  }
}
