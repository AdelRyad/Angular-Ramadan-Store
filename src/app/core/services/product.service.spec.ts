import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '../models/product.model';
import { PLATFORM_ID } from '@angular/core';
import { firstValueFrom } from 'rxjs';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  const mockProducts: Product[] = [
    {
      id: 1,
      title: 'Product 1',
      price: 10,
      category: 'cat1',
      description: 'desc1',
      image: '',
      rating: { rate: 4.5, count: 10 },
    },
    {
      id: 2,
      title: 'Product 2',
      price: 20,
      category: 'cat2',
      description: 'desc2',
      image: '',
      rating: { rate: 4.0, count: 5 },
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear localStorage
    localStorage.clear();

    // Trigger signals
    service.allProducts();
    service.categoriesResource.value();

    // Consume initial requests
    const matchCats = httpMock.match('https://fakestoreapi.com/products/categories');
    matchCats.forEach((req) => req.flush(['cat1', 'cat2']));

    const matchProds = httpMock.match('https://fakestoreapi.com/products');
    matchProds.forEach((req) => req.flush(mockProducts));
  });

  afterEach(() => {
    // Consume any leftover requests from reactive resources
    httpMock.match(() => true).forEach((r) => r.flush([]));
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(service.selectedCategory()).toBeNull();
    expect(service.searchQuery()).toBe('');
    expect(service.minPrice()).toBeNull();
    expect(service.maxPrice()).toBeNull();
  });

  it('should clear filters', () => {
    service.selectedCategory.set('electronics');
    service.searchQuery.set('test');
    service.minPrice.set(10);
    service.maxPrice.set(100);

    service.clearFilters();

    expect(service.selectedCategory()).toBeNull();
    expect(service.searchQuery()).toBe('');
    expect(service.minPrice()).toBeNull();
    expect(service.maxPrice()).toBeNull();
  });

  it('should add a local product', () => {
    const newProduct: Partial<Product> = {
      title: 'New Product',
      price: 50,
      category: 'electronics',
    };
    service.addProduct(newProduct);

    const allProducts = service.allProducts();
    expect(allProducts.length).toBeGreaterThan(0);
    expect(allProducts[0].title).toBe('New Product');
  });

  it('should delete a locally added product', () => {
    const originalCount = service.allProducts().length;
    const newProduct: Partial<Product> = {
      title: 'To Delete',
      price: 50,
      category: 'electronics',
      rating: { rate: 0, count: 0 },
    };
    service.addProduct(newProduct);
    const addedProduct = (service.allProducts() as any[]).find((p) => p.title === 'To Delete');

    service.deleteProduct(addedProduct.id);

    expect(service.allProducts().length).toBe(originalCount);
  });

  it('should update a product locally', () => {
    service.updateProduct(1, { title: 'Updated Title' });
  });

  it('should get product by id from local list if available', async () => {
    const newProduct: Partial<Product> = {
      title: 'Local Detail',
      price: 50,
      category: 'electronics',
      rating: { rate: 5, count: 1 },
    };
    service.addProduct(newProduct);
    const addedProduct = service.allProducts()[0];

    // Case 1: From local
    const p1 = await firstValueFrom(service.getProductById(addedProduct.id.toString()));
    expect(p1.title).toBe('Local Detail');

    // Case 2: From API
    const promise2 = firstValueFrom(service.getProductById('999'));
    const req = httpMock.expectOne('https://fakestoreapi.com/products/999');
    expect(req.request.method).toBe('GET');
    req.flush({
      id: 999,
      title: 'API Product',
      price: 15,
      description: 'API Desc',
      category: 'test',
      image: '',
      rating: { rate: 0, count: 0 },
    });

    const p2 = await promise2;
    expect(p2.id).toBe(999);
  });
});
