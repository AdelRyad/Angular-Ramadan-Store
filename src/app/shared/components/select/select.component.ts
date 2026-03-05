import {
  Component,
  input,
  output,
  forwardRef,
  ChangeDetectionStrategy,
  signal,
  ElementRef,
  inject,
  ViewChild,
  ChangeDetectorRef,
  computed,
  effect,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  label: string;
  value: any;
}

@Component({
  selector: 'app-select',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onClickOutside($event)',
  },
})
export class SelectComponent implements ControlValueAccessor {
  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);
  @ViewChild('trigger') triggerRef!: ElementRef;

  options = input<(string | SelectOption)[]>([]);
  placeholder = input<string>('Select an option');
  disabled = input<boolean>(false);
  customClass = input<string>('');
  value = input<any>(null);

  _value = signal<any>(null);

  private syncValueEffect = effect(() => {
    this._value.set(this.value());
  });

  valueChange = output<any>();

  isOpen = signal(false);
  openUpward = signal(false);
  maxHeight = signal<number | null>(null);

  onChange: any = () => {};
  onTouched: any = () => {};

  normalizedOptions = computed(() => {
    return this.options().map((opt) => {
      if (typeof opt === 'string') {
        return { label: opt, value: opt };
      }
      return opt;
    });
  });

  selectedOption = computed(() => {
    return this.normalizedOptions().find((opt) => opt.value === this._value());
  });

  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggleOpen() {
    if (this.disabled()) return;
    const nextState = !this.isOpen();

    if (nextState) {
      this.calculateDropdownPosition();
    }

    this.isOpen.set(nextState);
  }

  private calculateDropdownPosition() {
    if (!this.triggerRef) return;

    const triggerRect = this.triggerRef.nativeElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    // Minimum space we'd like to have (e.g. 250px)
    const minDesiredSpace = 250;

    if (spaceBelow < minDesiredSpace && spaceAbove > spaceBelow) {
      this.openUpward.set(true);
      this.maxHeight.set(Math.min(spaceAbove - 20, 400)); // 20px padding from top
    } else {
      this.openUpward.set(false);
      this.maxHeight.set(Math.min(spaceBelow - 20, 400)); // 20px padding from bottom
    }
  }

  selectOption(option: SelectOption) {
    this._value.set(option.value);
    this.onChange(option.value);
    this.onTouched();
    this.valueChange.emit(option.value);
    this.isOpen.set(false);
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this._value.set(value);
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Note: 'disabled' is an input signal, so it cannot be directly set here.
  }
}
