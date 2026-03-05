import { CurrencyPipe, UpperCasePipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ProductService } from '../../../core/services/product.service';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../core/services/toast.service';
import { LanguageService } from '../../../core/services/language.service';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe, TranslatePipe, RouterLink, UpperCasePipe, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent {
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  private langService = inject(LanguageService);
  private seoService = inject(SeoService);
  
  id = input.required<string>();
  productResource = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params }) => this.productService.getProductById(params.id),
  });

  colors = ['#fdf5e6', '#2f2f2f', '#8b7355'];
  selectedColor = signal(this.colors[0]);

  constructor() {
    effect(() => {
      const product = this.productResource.value();
      if (product) {
        this.seoService.updateTitle(product.title);
        this.seoService.updateDescription(product.description);
        this.seoService.updateOgImage(product.image);
      }
    });
  }

  selectColor(color: string) {
    this.selectedColor.set(color);
  }

  addToCart(productTitle: string) {
    const message = `${productTitle} ${this.langService.translate('ADDED_TO_CART')}`;
    this.toastService.show(message, 'success');
  }
}
