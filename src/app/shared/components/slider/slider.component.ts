import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  inject,
  effect,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-slider',
  imports: [FormsModule],
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderComponent implements AfterViewInit {
  private langService = inject(LanguageService);
  min = input<number>(0);
  max = input<number>(1000);
  step = input<number>(1);

  valueMin = model<number>(0);
  valueMax = model<number>(1000);

  @ViewChild('track') track!: ElementRef<HTMLDivElement>;

  private updateTrackEffect = effect(() => {
    // Re-run whenever these signals change
    this.langService.currentLang();
    this.min();
    this.max();
    this.valueMin();
    this.valueMax();
    this.updateTrack();
  });

  ngAfterViewInit() {
    this.updateTrack();
  }

  getZIndex(type: 'min' | 'max'): number {
    const rangeHalf = (this.max() - this.min()) / 2;
    if (type === 'min') {
      return this.valueMin() > rangeHalf ? 5 : 4;
    } else {
      return this.valueMin() > rangeHalf ? 4 : 5;
    }
  }

  onMinChange(event: Event) {
    const val = Number((event.target as HTMLInputElement).value);
    if (val > this.valueMax()) {
      this.valueMin.set(this.valueMax());
      (event.target as HTMLInputElement).value = this.valueMin().toString();
    } else {
      this.valueMin.set(val);
    }
    this.updateTrack();
  }

  onMaxChange(event: Event) {
    const val = Number((event.target as HTMLInputElement).value);
    if (val < this.valueMin()) {
      this.valueMax.set(this.valueMin());
      (event.target as HTMLInputElement).value = this.valueMax().toString();
    } else {
      this.valueMax.set(val);
    }
    this.updateTrack();
  }

  private updateTrack() {
    if (!this.track) return;
    const isRtl = this.langService.currentLang() === 'ar';
    const range = this.max() - this.min();
    const el = this.track.nativeElement;

    // 1. FULL RESET
    el.style.left = '';
    el.style.right = '';
    el.style.insetInlineStart = '';
    el.style.insetInlineEnd = '';
    el.style.width = '';

    // 2. Handle Edge Case: No range
    if (range <= 0) {
      el.style.width = '100%';
      el.style.insetInlineStart = '0';
      el.style.insetInlineEnd = '0';
      return;
    }

    // 3. Calculate Clamped Percentages
    const clampedMin = Math.max(this.min(), Math.min(this.max(), this.valueMin()));
    const clampedMax = Math.max(this.min(), Math.min(this.max(), this.valueMax()));

    const minPercent = ((clampedMin - this.min()) / range) * 100;
    const maxPercent = ((clampedMax - this.min()) / range) * 100;
    const endPercent = 100 - maxPercent;

    const thumbWidth = 18;
    const halfThumb = thumbWidth / 2;

    const startGap = `calc(${minPercent}% + (${halfThumb}px - ${minPercent / 100} * ${thumbWidth}px))`;
    const endGap = `calc(${endPercent}% + (${halfThumb}px - ${endPercent / 100} * ${thumbWidth}px))`;

    // 4. Set Styling
    el.style.width = 'auto';
    if (isRtl) {
      el.style.right = startGap;
      el.style.left = endGap;
    } else {
      el.style.left = startGap;
      el.style.right = endGap;
    }
  }
}
