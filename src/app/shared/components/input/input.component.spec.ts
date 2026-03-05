import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { InputComponent } from './input.component';
import { By } from '@angular/platform-browser';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, InputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render an input by default', () => {
    const input = fixture.debugElement.query(By.css('input'));
    expect(input).toBeTruthy();
    expect(fixture.debugElement.query(By.css('textarea'))).toBeFalsy();
  });

  it('should render a textarea when type is textarea', () => {
    fixture.componentRef.setInput('type', 'textarea');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('textarea'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('input'))).toBeFalsy();
  });

  it('should update value on input change', () => {
    const input = fixture.debugElement.query(By.css('input')).nativeElement;
    input.value = 'New value';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.value).toBe('New value');
  });

  it('should be disabled when set via Input', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.disabled).toBe(true);
  });

  it('should call onChange and onTouched on value change and blur', () => {
    const onChangeSpy = vi.fn();
    const onTouchedSpy = vi.fn();

    component.registerOnChange(onChangeSpy);
    component.registerOnTouched(onTouchedSpy);

    const inputDebug = fixture.debugElement.query(By.css('input'));
    const input = inputDebug.nativeElement;

    input.value = 'Changed';
    input.dispatchEvent(new Event('input'));
    expect(onChangeSpy).toHaveBeenCalledWith('Changed');

    inputDebug.triggerEventHandler('blur', null);
    expect(onTouchedSpy).toHaveBeenCalled();
  });
});
