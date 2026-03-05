import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { By } from '@angular/platform-browser';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit onClick event when clicked', () => {
    const onClickSpy = vi.fn();
    component.onClick.subscribe(onClickSpy);

    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();

    expect(onClickSpy).toHaveBeenCalled();
  });

  it('should be disabled when disabled input is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(button.disabled).toBe(true);
  });

  it('should be disabled when loading is true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(button.disabled).toBe(true);
  });

  it('should show loader when loading is true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const loader = fixture.debugElement.query(By.css('.loader'));
    expect(loader).toBeTruthy();
  });
});
