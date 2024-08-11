import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectedVolsComponent } from './selected-vols.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Price {
  currency: string;
  total: string;
  base: string;
}


interface TravelerPricing {
  travelerType: string;
  price: Price;
  cabin: string;
  fareBasis: string;
  brandedFare?: string;
  class: string;
}

describe('SelectedVolsComponent', () => {
  let component: SelectedVolsComponent;
  let fixture: ComponentFixture<SelectedVolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [SelectedVolsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedVolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate total price correctly', () => {
    component.vols = [
      {
        aller: {
          departure: { iataCode: 'LYS', at: '2024-08-16T06:20:00' },
          arrival: { iataCode: 'LIS', at: '2024-08-16T07:55:00' },
          carrierCode: 'TP',
          number: '475',
          aircraft: 'E90',
          duration: 'PT5H15M',
          numberOfStops: 0,
          price: { currency: 'EUR', total: '510.35', base: '61.00' },
          travelers: []
        },
        retour: {
          departure: { iataCode: 'LIS', at: '2024-08-19T11:25:00' },
          arrival: { iataCode: 'LYS', at: '2024-08-19T12:45:00' },
          carrierCode: 'TP',
          number: '476',
          aircraft: 'E90',
          duration: 'PT5H15M',
          numberOfStops: 0,
          price: { currency: 'EUR', total: '683.80', base: '270.00' },
          travelers: []
        }
      }
    ];

    const totalPrice = component.calculateTotalPrice();
    expect(totalPrice).toEqual(1194.15); // 510.35 + 683.80
  });

  it('should format duration correctly', () => {
    const formattedDuration = component.formatDuration('PT5H15M');
    expect(formattedDuration).toBe('5h 15m');
  });

  it('should return correct city name based on IATA code', () => {
    component.villes = [
      { code: 'LYS', name: 'Lyon, France' },
      { code: 'LIS', name: 'Lisbonne, Portugal' }
    ];

    const cityName = component.getCityName('LYS');
    expect(cityName).toBe('Lyon, France');

    const unknownCityName = component.getCityName('XYZ');
    expect(unknownCityName).toBe('XYZ'); // Should return the IATA code if not found
  });

  it('should calculate price and count correctly', () => {
    const travelers: TravelerPricing[] = [
      { travelerType: 'ADULT', price: { currency: 'EUR', total: '100', base: '80' }, cabin: 'ECONOMY', fareBasis: 'BASIC', class: 'E' },
      { travelerType: 'ADULT', price: { currency: 'EUR', total: '100', base: '80' }, cabin: 'ECONOMY', fareBasis: 'BASIC', class: 'E' },
      { travelerType: 'CHILD', price: { currency: 'EUR', total: '50', base: '40' }, cabin: 'ECONOMY', fareBasis: 'BASIC', class: 'E' }
    ];

    const adultPriceAndCount = component.calculatePriceAndCount(travelers, 'ADULT');
    expect(adultPriceAndCount).toBe('2 x 100 EUR = 200.00 EUR');

    const childPriceAndCount = component.calculatePriceAndCount(travelers, 'CHILD');
    expect(childPriceAndCount).toBe('1 x 50 EUR = 50.00 EUR');
  });

  it('should toggle termsAccepted correctly', () => {
    component.termsAccepted = false;
    component.toggleTermsAccepted();
    expect(component.termsAccepted).toBeTrue();

    component.toggleTermsAccepted();
    expect(component.termsAccepted).toBeFalse();
  });

  it('should emit confirmDetails when onContinue is called and termsAccepted is true', () => {
    spyOn(component.confirmDetails, 'emit');
    component.termsAccepted = true;
    component.onContinue();
    expect(component.confirmDetails.emit).toHaveBeenCalled();
  });

  it('should not emit confirmDetails when onContinue is called and termsAccepted is false', () => {
    spyOn(component.confirmDetails, 'emit');
    component.termsAccepted = false;
    component.onContinue();
    expect(component.confirmDetails.emit).not.toHaveBeenCalled();
  });
});
