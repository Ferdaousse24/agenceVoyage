import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentComponent } from './payment.component';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('PaymentComponent', () => {
  let component: PaymentComponent;
  let fixture: ComponentFixture<PaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],  // Ajout de FormsModule car le composant utilise ngModel
      declarations: [PaymentComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the total amount', () => {
    component.totalAmount = 120;
    fixture.detectChanges();

    const totalAmountElement = fixture.debugElement.query(By.css('p')).nativeElement;
    expect(totalAmountElement.textContent).toContain('120 EUR');
  });

  it('should emit paymentSubmit when the form is valid and submitted', () => {
    spyOn(component.paymentSubmit, 'emit');

    // Remplir les détails de paiement valides
    component.paymentDetails = {
      cardNumber: '1234567812345678',
      cardHolder: 'John Doe',
      expirationDate: '12/24',
      cvv: '123'
    };

    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    button.click();

    expect(component.paymentSubmit.emit).toHaveBeenCalledWith(component.paymentDetails);
  });

  it('should not emit paymentSubmit when the form is invalid', () => {
    spyOn(component.paymentSubmit, 'emit');

    // Laisser les détails de paiement invalides (par exemple, numéro de carte incorrect)
    component.paymentDetails = {
      cardNumber: '1234',
      cardHolder: '',
      expirationDate: '12/24',
      cvv: '12'
    };

    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    button.click();

    expect(component.paymentSubmit.emit).not.toHaveBeenCalled();
  });

  it('should validate the form correctly', () => {
    component.paymentDetails = {
      cardNumber: '1234567812345678',
      cardHolder: 'John Doe',
      expirationDate: '12/24',
      cvv: '123'
    };

    expect(component.isFormValid()).toBeTrue();

    component.paymentDetails.cardNumber = '1234';  // Invalid card number
    expect(component.isFormValid()).toBeFalse();
  });

  it('should disable the button if form is invalid', () => {
    component.paymentDetails = {
      cardNumber: '1234',  // Invalid card number
      cardHolder: '',
      expirationDate: '',
      cvv: ''
    };

    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(button.disabled).toBeTrue();
  });

  it('should enable the button if form is valid', () => {
    component.paymentDetails = {
      cardNumber: '1234567812345678',
      cardHolder: 'John Doe',
      expirationDate: '12/24',
      cvv: '123'
    };

    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(button.disabled).toBeFalse();
  });
});
