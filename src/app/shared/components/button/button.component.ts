import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="'btn btn-' + variant() + ' ' + customClass()"
      (click)="onClick.emit($event)"
    >
      @if (loading()) {
        <span class="loader"></span>
      }
      <span class="btn-text" [class.invisible]="loading()">
        <ng-content></ng-content>
      </span>
    </button>
  `,
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  variant = input<'primary' | 'outline' | 'destructive' | 'secondary' | 'ghost'>('primary');
  type = input<'button' | 'submit'>('button');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  customClass = input<string>('');

  onClick = output<MouseEvent>();
}
