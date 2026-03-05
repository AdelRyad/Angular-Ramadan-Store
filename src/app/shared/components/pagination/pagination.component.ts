import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
  computed,
  inject,
  signal,
  effect,
} from '@angular/core';
import { SelectComponent } from '../select/select.component';
import { LanguageService } from '../../../core/services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-pagination',
  imports: [SelectComponent, TranslatePipe],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  protected langService = inject(LanguageService);

  currentPage = input(1);
  totalPages = input(1);
  totalItems = input(0);
  pageSize = input(10);
  pageSizeOptions = input<number[]>([5, 10, 20, 50]);

  pageChange = output<number>();
  pageSizeChange = output<number>();

  // Internal state for instant UI feedback
  internalPage = signal(1);

  constructor() {
    // Sync internal state with input when it changes from parent
    effect(() => {
      this.internalPage.set(this.currentPage());
    });
  }

  pageSizeSelectOptions = computed(() => {
    return this.pageSizeOptions().map((size) => ({
      label: size.toString(),
      value: size,
    }));
  });

  startRange = computed(() =>
    Math.min((this.currentPage() - 1) * this.pageSize() + 1, this.totalItems()),
  );

  endRange = computed(() => Math.min(this.currentPage() * this.pageSize(), this.totalItems()));

  pages = computed(() => {
    const total = this.totalPages();
    const current = this.internalPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 4) pages.push(-1); // Ellipsis

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      if (current <= 4) {
        for (let i = 2; i <= 4; i++) pages.push(i);
      } else if (current >= total - 3) {
        for (let i = total - 3; i <= total - 1; i++) pages.push(i);
      } else {
        for (let i = start; i <= end; i++) pages.push(i);
      }

      if (current < total - 3) pages.push(-1); // Ellipsis
      pages.push(total);
    }

    return pages;
  });

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages() && page !== this.internalPage()) {
      this.internalPage.set(page); // Update local active style instantly
      this.pageChange.emit(page);
    }
  }

  onSizeChange(size: number) {
    this.pageSizeChange.emit(size);
  }
}
