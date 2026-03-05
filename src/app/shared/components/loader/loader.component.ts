import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-global-loader',
  template: `
    @if (loadingService.isLoading()) {
      <div class="global-overlay">
        <div class="spinner"></div>
      </div>
    }
  `,
  styleUrl: './loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent {
  width = input('300px');
  height = input('300px');
  protected loadingService = inject(LoadingService);
}
