import { CurrencyPipe, NgOptimizedImage, UpperCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';

import { ButtonComponent } from '../../../shared/components/button/button.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SelectComponent } from '../../../shared/components/select/select.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { InputComponent } from '../../../shared/components/input/input.component';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    UpperCasePipe,
    TranslatePipe,
    ButtonComponent,
    PaginationComponent,
    SelectComponent,
    ModalComponent,
    InputComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent implements OnInit {
  private fb = inject(FormBuilder);
  protected productService = inject(ProductService);
  private toastService = inject(ToastService);

  showModal = signal<boolean>(false);
  selectedProduct = signal<Product | null>(null);

  showDeleteModal = signal<boolean>(false);
  productToDelete = signal<number | null>(null);

  ngOnInit() {
    this.productService.clearFilters();
  }

  productForm = this.fb.group({
    title: this.fb.control('', { validators: [Validators.required, Validators.minLength(3)], nonNullable: true }),
    price: this.fb.control(0, { validators: [Validators.required, Validators.min(0)], nonNullable: true }),
    description: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
    category: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
    image: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
  });

  currentPage = signal(1);
  pageSize = signal(5);

  paginatedProducts = computed(() => {
    const products = this.productService.allProducts() || [];
    const start = (this.currentPage() - 1) * this.pageSize();
    return products.slice(start, start + this.pageSize());
  });

  totalPages = computed(() => {
    const total = this.productService.allProducts()?.length || 0;
    return Math.ceil(total / this.pageSize());
  });
  onAdd() {
    this.selectedProduct.set(null);
    this.productForm.reset();
    this.showModal.set(true);
  }
  onEdit(product: Product) {
    this.selectedProduct.set(product);
    this.productForm.patchValue(product);
    this.showModal.set(true);
  }
  onSubmit() {
    if (this.productForm.valid) {
      const productData = this.productForm.value as Partial<Product>;
      const product = this.selectedProduct();

      if (product) {
        this.productService.updateProduct(product.id, productData);
        this.showModal.set(false);
        this.productService.productsResource.reload();
        this.toastService.show('PRODUCT_UPDATED_SUCCESS', 'success');
      } else {
        this.productService.addProduct(productData);
        this.showModal.set(false);
        this.productService.productsResource.reload();
        this.toastService.show('PRODUCT_ADDED_SUCCESS', 'success');
      }
    }
  }

  onDelete(id: number) {
    this.productToDelete.set(id);
    this.showDeleteModal.set(true);
  }

  confirmDelete() {
    const id = this.productToDelete();
    if (id !== null) {
      this.productService.deleteProduct(id);
      this.toastService.show('PRODUCT_DELETED_SUCCESS', 'success');
    }
    this.productToDelete.set(null);
    this.showDeleteModal.set(false);
  }

  cancelDelete() {
    this.productToDelete.set(null);
    this.showDeleteModal.set(false);
  }

  isPaginating = signal(false);

  totalItems = computed(() => this.productService.allProducts()?.length || 0);

  setPage(page: number) {
    this.currentPage.set(page);
    this.simulatePaginationLoading(() => {
      // Data is already set, this callback can be empty or used for other logic
    });
  }

  changePageSize(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  private simulatePaginationLoading(action: () => void) {
    this.isPaginating.set(true);
    setTimeout(() => {
      action(); // Only actually perform the action right before the skeleton vanishes or wait for the data to change immediately?
      // Given we are simulating network load: change the page, let the skeleton show, then reveal.
      this.isPaginating.set(false);
    }, 1200);
  }
}
