import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Product } from '../models/product.model';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'https://fakestoreapi.com';
  private plateformId = inject(PLATFORM_ID);
  private doc = inject(DOCUMENT);
  protected isBrowser = isPlatformBrowser(this.plateformId);

  //local Overrides

  private localAdded = signal<Product[]>([]);
  private localUpdated = signal<Record<number, Product>>({});
  private localDeleted = signal<number[]>([]);

  selectedCategory = signal<string | null>(null);
  searchQuery = signal<string>('');
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);

  isMobileFilterOpen = signal<boolean>(false);
  toggleMobileFilter() {
    this.isMobileFilterOpen.update((v) => !v);
    this.syncBodyScroll(this.isMobileFilterOpen());
  }
  closeMobileFilter() {
    this.isMobileFilterOpen.set(false);
    this.syncBodyScroll(false);
  }
  private syncBodyScroll(lock: boolean) {
    if (this.isBrowser) {
      this.doc.body.style.overflow = lock ? 'hidden' : '';
    }
  }

  constructor() {
    if (this.isBrowser) {
      this.localAdded.set(this.load('added', []));
      this.localUpdated.set(this.load('updated', {}));
      this.localDeleted.set(this.load('deleted', []));
      effect(() => {
        if (this.isMobileFilterOpen()) {
          document.body.classList.add('no-scroll');
        } else {
          document.body.classList.remove('no-scroll');
        }
      });
    }
  }

  // 1. Categories
  categoriesResource = rxResource({
    stream: () => this.http.get<string[]>(`${this.apiUrl}/products/categories`).pipe(delay(1500)),
  });

  // 2. Products
  productsResource = rxResource({
    params: () => ({ category: this.selectedCategory() }),
    stream: ({ params }) => {
      const url = params.category
        ? `${this.apiUrl}/products/category/${params.category}`
        : `${this.apiUrl}/products`;
      return this.http.get<Product[]>(url).pipe(delay(1500));
    },
  });

  allProducts = computed(() => {
    const apiData =
      this.productsResource.status() === 'error' ? [] : this.productsResource.value() || [];
    const query = this.searchQuery().toLowerCase();
    const minP = this.minPrice();
    const maxP = this.maxPrice();
    const currentCategory = this.selectedCategory();

    // 1. Filter API data (exclude deleted, apply updates)
    let list = apiData?.filter((p) => !this.localDeleted().includes(p.id)) || [];
    list = list.map((p) => {
      const update = this.localUpdated()[p.id];
      return update ? { ...p, ...update } : p;
    });

    // 2. Filter Local Additions by the selected category
    const filteredLocalAdded = this.localAdded().filter((p) => {
      if (!currentCategory) return true;
      return p.category === currentCategory;
    });

    // 3. Merge them
    let merged = [...filteredLocalAdded, ...list];

    // 4. Apply Search & Price filters locally
    if (query) {
      merged = merged.filter(
        (p) => p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query),
      );
    }
    if (minP !== null) {
      merged = merged.filter((p) => p.price >= minP);
    }
    if (maxP !== null) {
      merged = merged.filter((p) => p.price <= maxP);
    }

    return merged;
  });

  clearFilters() {
    this.selectedCategory.set(null);
    this.searchQuery.set('');
    this.minPrice.set(null);
    this.maxPrice.set(null);
  }

  setCategory(category: string | null) {
    this.selectedCategory.set(category);
  }
  getProductById(id: string) {
    const numericId = Number(id);

    // 1. Check if it's a locally added product
    const local = this.allProducts().find((p) => p.id === numericId);
    if (local) {
      // Return a fake observable so the component logic stays the same
      return of(local).pipe(delay(1500));
    }

    // 2. Otherwise, fetch from the API
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`).pipe(delay(1500));
  }
  addProduct(product: Partial<Product>) {
    const newProduct = { ...product, id: Date.now() } as Product;
    this.localAdded.update((prev) => [newProduct, ...prev]);
    this.save('added', this.localAdded());
  }
  updateProduct(id: number, product: Partial<Product>) {
    const isLocalAdded = this.localAdded().some((p) => p.id === id);

    if (isLocalAdded) {
      // Update the localAdded list directly
      this.localAdded.update((prev) => prev.map((p) => (p.id === id ? { ...p, ...product } : p)));
      this.save('added', this.localAdded());
    } else {
      // API product: store partial override
      this.localUpdated.update((prev) => ({
        ...prev,
        [id]: { ...prev[id], ...product, id } as Product,
      }));
      this.save('updated', this.localUpdated());
    }
  }
  deleteProduct(id: number) {
    const isLocalAdded = this.localAdded().some((p) => p.id === id);

    if (isLocalAdded) {
      // Remove from locally added list
      this.localAdded.update((prev) => prev.filter((p) => p.id !== id));
      this.save('added', this.localAdded());
    } else {
      // Add to deleted list to hide from API results
      this.localDeleted.update((prev) => [...prev, id]);
      this.save('deleted', this.localDeleted());
    }
  }

  private save(key: string, data: any) {
    if (this.isBrowser) localStorage.setItem(`mock_${key}`, JSON.stringify(data));
  }
  private load(key: string, defaultValue: any) {
    if (!this.isBrowser) return defaultValue;

    const data = localStorage.getItem(`mock_${key}`);
    return data ? JSON.parse(data) : defaultValue;
  }
}
