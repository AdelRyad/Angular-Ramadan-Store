import {
  Component,
  input,
  output,
  forwardRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  TemplateRef,
  signal,
  effect,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  imports: [NgTemplateOutlet, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements ControlValueAccessor {
  private cdr = inject(ChangeDetectorRef);

  id = input<string>('');
  name = input<string>('');
  type = input<'text' | 'number' | 'password' | 'email' | 'textarea'>('text');
  placeholder = input<string>('');
  disabled = input<boolean>(false);
  icon = input<TemplateRef<any> | null>(null);
  rows = input<number>(3);
  value = input<any>('');

  _value = signal<any>('');

  private syncValueEffect = effect(() => {
    this._value.set(this.value());
  });

  valueChange = output<any>();

  onChange: any = () => {};
  onTouched: any = () => {};

  onValueChange(val: any) {
    this._value.set(val);
    this.onChange(val);
    this.valueChange.emit(val);
  }

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
    // Usually setDisabledState is for the reactive form control state.
    // If we want to support it, we might need a local 'isDisabled' signal or similar.
    // For now, let's keep it as is, but be aware that input signals are read-only.
  }
}
