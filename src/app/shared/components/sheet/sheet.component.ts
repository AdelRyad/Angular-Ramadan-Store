import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
  effect,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationService } from '../../../core/services/navigation.service';

@Component({
  selector: 'app-sheet',
  imports: [],
  template: `
    @if (isOpen()) {
      <div class="sheet-backdrop" (click)="onBackdropClick()"></div>
      <div
        class="sheet-container"
        [class.open]="isOpen()"
        [class]="'sheet-container side-' + side() + ' ' + customClass()"
        (click)="$event.stopPropagation()"
      >
        <div class="sheet-header">
          <ng-content select="[sheetHeader]"></ng-content>
          <button class="close-btn" (click)="close.emit()" aria-label="Close">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="sheet-body">
          <ng-content></ng-content>
        </div>

        <div class="sheet-footer">
          <ng-content select="[sheetFooter]"></ng-content>
        </div>
      </div>
    }
  `,
  styleUrls: ['./sheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SheetComponent {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private navigationService = inject(NavigationService);

  isOpen = input<boolean>(false);
  side = input<'top' | 'right' | 'bottom' | 'left'>('right');
  customClass = input<string>('');
  closeOnBackdrop = input<boolean>(true);
  closeOnDesktop = input<boolean>(false);
  close = output<void>();

  private autoCloseEffect = effect(() => {
    // Auto-close if mobile-only and resized to desktop
    if (this.closeOnDesktop() && this.navigationService.screenWidth() > 900 && this.isOpen()) {
      this.close.emit();
    }
  });

  private scrollLockEffect = effect(() => {
    if (this.isBrowser) {
      if (this.isOpen()) {
        document.body.classList.add('no-scroll');
      } else {
        const hasEmptySheets =
          !document.querySelector('.sheet-backdrop') && !document.querySelector('.modal-backdrop');
        if (hasEmptySheets) {
          document.body.classList.remove('no-scroll');
        }
      }
    }
  });

  onBackdropClick() {
    if (this.closeOnBackdrop()) {
      this.close.emit();
    }
  }
}
