import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-toast',
  imports: [TranslatePipe],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  toastService = inject(ToastService);
}
