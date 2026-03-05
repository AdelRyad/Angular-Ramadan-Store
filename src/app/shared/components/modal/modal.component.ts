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

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  isOpen = input<boolean>(false);
  customClass = input<string>('');
  closeOnBackdrop = input<boolean>(true);
  close = output<void>();

  private scrollLockEffect = effect(() => {
    if (this.isBrowser) {
      if (this.isOpen()) {
        document.body.classList.add('no-scroll');
      } else {
        // Only remove if there are no other modals/sheets open
        const hasEmptyModals =
          !document.querySelector('.modal-backdrop') &&
          !document.querySelector('.sheet-container.open');
        if (hasEmptyModals) {
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
