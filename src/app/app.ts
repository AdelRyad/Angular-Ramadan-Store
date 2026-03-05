import { Component, signal, afterNextRender, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { LoadingService } from './core/services/loading.service';
import { NavigationService } from './core/services/navigation.service';
import { ProductService } from './core/services/product.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, ToastComponent, LoaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('e-commerce');
  isHydrating = signal(true);

  private loadingService = inject(LoadingService);
  protected navService = inject(NavigationService);
  protected productService = inject(ProductService);

  constructor() {
    // Show loader initially to cover auth state checking
    this.loadingService.show();

    afterNextRender(() => {
      this.isHydrating.set(false);
      // Wait a bit for router and hydrating to settle before hiding the loader
      setTimeout(() => {
        this.loadingService.hide();
      }, 1500);
    });
  }
}
