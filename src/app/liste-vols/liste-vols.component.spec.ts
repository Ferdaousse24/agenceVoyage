import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListeVolsComponent } from './liste-vols.component';
import { By } from '@angular/platform-browser';

describe('ListeVolsComponent', () => {
  let component: ListeVolsComponent;
  let fixture: ComponentFixture<ListeVolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListeVolsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListeVolsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select a departure vol correctly', () => {
    const mockParcours = {
      criteres: {
        departureCity: 'Paris',
        destinationCity: 'London',
        tripType: 'round-trip'
      },
      vols: {
        volsAlle: [
          { price: { total: '100' }, itineraries: [{ segments: [{ departure: { at: '2024-08-10T10:00:00' }, arrival: { at: '2024-08-10T12:00:00' } }] }] },
          { price: { total: '200' }, itineraries: [{ segments: [{ departure: { at: '2024-08-11T10:00:00' }, arrival: { at: '2024-08-11T12:00:00' } }] }] },
        ],
        volsRetour: []
      }
    };

    component.parcours = mockParcours;
    fixture.detectChanges();

    // Select the first departure vol
    component.handleVolSelection(0);
    expect(component.selectedIndices[0]).toBe(0);

    // Select the second departure vol
    component.handleVolSelection(1);
    expect(component.selectedIndices[0]).toBe(1);
  });

  it('should select a return vol correctly', () => {
    const mockParcours = {
      criteres: {
        departureCity: 'Paris',
        destinationCity: 'London',
        tripType: 'round-trip'
      },
      vols: {
        volsAlle: [],
        volsRetour: [
          { price: { total: '150' }, itineraries: [{ segments: [{ departure: { at: '2024-08-20T10:00:00' }, arrival: { at: '2024-08-20T12:00:00' } }] }] },
          { price: { total: '250' }, itineraries: [{ segments: [{ departure: { at: '2024-08-21T10:00:00' }, arrival: { at: '2024-08-21T12:00:00' } }] }] },
        ]
      }
    };

    component.parcours = mockParcours;
    fixture.detectChanges();

    // Select the first return vol
    component.handleReturnVolSelection(0);
    expect(component.selectedIndices[1]).toBe(0);

    // Select the second return vol
    component.handleReturnVolSelection(1);
    expect(component.selectedIndices[1]).toBe(1);
  });

  it('should calculate the total price correctly', () => {
    const mockParcours = {
      criteres: {
        departureCity: 'Paris',
        destinationCity: 'London',
        tripType: 'round-trip'
      },
      vols: {
        volsAlle: [
          { price: { total: '100' }, itineraries: [{ segments: [{ departure: { at: '2024-08-10T10:00:00' }, arrival: { at: '2024-08-10T12:00:00' } }] }] },
        ],
        volsRetour: [
          { price: { total: '150' }, itineraries: [{ segments: [{ departure: { at: '2024-08-20T10:00:00' }, arrival: { at: '2024-08-20T12:00:00' } }] }] },
        ]
      }
    };

    component.parcours = mockParcours;
    fixture.detectChanges();

    // Select the departure vol
    component.handleVolSelection(0);
    // Select the return vol
    component.handleReturnVolSelection(0);

    const totalPrice = component.calculateTotalPrice();
    expect(totalPrice).toBe(250);
  });

  it('should emit selected indices correctly when a vol is selected', () => {
    spyOn(component.volChoisi, 'emit');

    const mockParcours = {
      criteres: {
        departureCity: 'Paris',
        destinationCity: 'London',
        tripType: 'round-trip'
      },
      vols: {
        volsAlle: [
          { price: { total: '100' }, itineraries: [{ segments: [{ departure: { at: '2024-08-10T10:00:00' }, arrival: { at: '2024-08-10T12:00:00' } }] }] },
        ],
        volsRetour: [
          { price: { total: '150' }, itineraries: [{ segments: [{ departure: { at: '2024-08-20T10:00:00' }, arrival: { at: '2024-08-20T12:00:00' } }] }] },
        ]
      }
    };

    component.parcours = mockParcours;
    fixture.detectChanges();

    // Select the departure vol
    component.handleVolSelection(0);
    // Select the return vol
    component.handleReturnVolSelection(0);

    // Emit the selection
    component.onVolSelected();
    expect(component.volChoisi.emit).toHaveBeenCalledWith([0, 0]);
  });

  it('should format duration correctly', () => {
    const duration = 'PT2H30M';
    const formattedDuration = component.formatDuration(duration);
    expect(formattedDuration).toBe('2h 30m');
  });
});
