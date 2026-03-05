import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { LanguageService } from '../../../core/services/language.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { CurrencyPipe, NgTemplateOutlet, UpperCasePipe, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SheetComponent } from '../../../shared/components/sheet/sheet.component';
import { SliderComponent } from '../../../shared/components/slider/slider.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-product-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    CurrencyPipe,
    UpperCasePipe,
    RouterLink,
    FormsModule,
    SheetComponent,
    SliderComponent,
    InputComponent,
    ButtonComponent,
    NgTemplateOutlet,
    NgOptimizedImage,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent {
  protected productService = inject(ProductService);
  protected langService = inject(LanguageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private seoService = inject(SeoService);

  private searchSubject = new Subject<string>();

  // Draft (pending) values — not applied until user clicks "Apply Filters"
  draftCategory = signal<string | null>(null);
  draftMinPrice = signal<number>(0);
  draftMaxPrice = signal<number>(1000);

  // Calculate bounds based on draft category
  productsInCategory = computed(() => {
    const res = this.productService.productsResource;
    return res.status() === 'error' ? [] : res.value() || [];
  });

  minBound = computed(() => {
    const products = this.productsInCategory();
    if (products.length === 0) return 0;
    return Math.floor(Math.min(...products.map((p) => p.price)));
  });

  maxBound = computed(() => {
    const products = this.productsInCategory();
    if (products.length === 0) return 1000;
    return Math.ceil(Math.max(...products.map((p) => p.price)));
  });

  constructor() {
    this.seoService.updateTitle('Products');
    this.seoService.updateDescription('Browse our extensive collection of premium products.');

    // 1. Read initial URL params and update service state
    const params = this.route.snapshot.queryParams;

    if (params['category']) {
      this.productService.selectedCategory.set(params['category']);
      this.draftCategory.set(params['category']);
    }
    if (params['search']) {
      this.productService.searchQuery.set(params['search']);
    }
    if (params['minPrice']) {
      const min = Number(params['minPrice']);
      this.productService.minPrice.set(min);
      this.draftMinPrice.set(min);
    }
    if (params['maxPrice']) {
      const max = Number(params['maxPrice']);
      this.productService.maxPrice.set(max);
      this.draftMaxPrice.set(max);
    }

    // Search is applied immediately (debounced) without needing Apply
    this.searchSubject
      .pipe(debounceTime(400), takeUntilDestroyed())
      .subscribe((val) => this.productService.searchQuery.set(val));

    // Initial sync of draft category
    this.draftCategory.set(this.productService.selectedCategory());

    // Reset or Clamp prices whenever the products list changes
    // BUT only if no specific price filter is already active in the service.
    effect(() => {
      const min = this.minBound();
      const max = this.maxBound();

      if (this.productService.minPrice() === null) {
        this.draftMinPrice.set(min);
      } else {
        // Clamp existing filter to new bounds
        this.draftMinPrice.update((curr) => Math.max(min, Math.min(max, curr)));
      }

      if (this.productService.maxPrice() === null) {
        this.draftMaxPrice.set(max);
      } else {
        // Clamp existing filter to new bounds
        this.draftMaxPrice.update((curr) => Math.max(min, Math.min(max, curr)));
      }
    });

    // Initial sync from service state
    effect(() => {
      const svcMin = this.productService.minPrice();
      const svcMax = this.productService.maxPrice();
      if (svcMin !== null) this.draftMinPrice.set(svcMin);
      if (svcMax !== null) this.draftMaxPrice.set(svcMax);
    });

    // EFFECT: Sync service state back to URL
    effect(() => {
      const category = this.productService.selectedCategory();
      const search = this.productService.searchQuery();
      const min = this.productService.minPrice();
      const max = this.productService.maxPrice();

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          category: category || null,
          search: search || null,
          minPrice: min !== null ? min : null,
          maxPrice: max !== null ? max : null,
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }

  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }

  selectCategory(cat: string | null) {
    this.draftCategory.set(cat);
  }

  applyFilters() {
    this.productService.setCategory(this.draftCategory());
    this.productService.minPrice.set(this.draftMinPrice());
    this.productService.maxPrice.set(this.draftMaxPrice());
    this.productService.closeMobileFilter();
  }

  clearDraftFilters() {
    this.draftCategory.set(null);
    this.productService.clearFilters();
    // effect will handle resetting prices to absolute bounds
  }
}
