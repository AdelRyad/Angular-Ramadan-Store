import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { ProductService } from '../../../core/services/product.service';
import { NavigationService } from '../../../core/services/navigation.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { SheetComponent } from '../../../shared/components/sheet/sheet.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, TranslatePipe, SheetComponent, ButtonComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  protected authService = inject(AuthService);
  protected langService = inject(LanguageService);
  protected productService = inject(ProductService);
  protected navService = inject(NavigationService);

  private router = inject(Router);
  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => (event as NavigationEnd).urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  // Show filter button only on the products LIST page, not product detail (/products/123)
  showFilterButton = computed(() => {
    const url = this.currentUrl();
    return url === '/products' || url.startsWith('/products?');
  });
  toggleLanguage() {
    const nextLang = this.langService.currentLang() === 'en' ? 'ar' : 'en';
    this.langService.setLanguage(nextLang);
  }
}
