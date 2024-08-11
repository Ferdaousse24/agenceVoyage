import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormRechercheVolsComponent } from './form-recherche-vols.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('FormRechercheVolsComponent', () => {
  let component: FormRechercheVolsComponent;
  let fixture: ComponentFixture<FormRechercheVolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatButtonModule,
        BrowserAnimationsModule
      ],
      declarations: [FormRechercheVolsComponent]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormRechercheVolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form controls with default values', () => {
    expect(component.departureControl.value).toBe('');
    expect(component.destinationControl.value).toBe('');
    expect(component.tripTypeControl.value).toBe('round-trip');
    expect(component.adultsControl.value).toBe(1);
    expect(component.childrenControl.value).toBe(0);
    expect(component.infantsControl.value).toBe(0);
  });

  it('should filter departure cities based on input', () => {
    component.cities = [
      { code: 'GVA', name: 'Geneve, Suisse' },
      { code: 'ZRH', name: 'Zurich, Suisse' }
    ];

    component.departureControl.setValue('Gene');
    fixture.detectChanges();

    component.filteredOptions.subscribe(options => {
      expect(options.length).toBe(1);
      expect(options[0].name).toBe('Geneve, Suisse');
    });
  });

  it('should disable return date control if trip type is one-way', () => {
    component.tripTypeControl.setValue('one-way');
    component.onTripTypeChange();
    fixture.detectChanges();

    expect(component.returnDateControl.disabled).toBeTruthy();
  });

  it('should validate the form as invalid if required fields are missing', () => {
    component.departureControl.setValue('');
    component.destinationControl.setValue('');
    component.departureDateControl.setValue('');
    fixture.detectChanges();

    expect(component.departureControl.valid).toBeFalsy();
    expect(component.destinationControl.valid).toBeFalsy();
    expect(component.departureDateControl.valid).toBeFalsy();
  });

  it('should emit critereSubmit event with correct values when form is valid', () => {
    spyOn(component.critereSubmit, 'emit');

    component.departureControl.setValue('Geneve, Suisse');
    component.destinationControl.setValue('Zurich, Suisse');
    component.departureDateControl.setValue('2024-08-10');
    component.tripTypeControl.setValue('round-trip');
    component.returnDateControl.setValue('2024-08-15');
    component.adultsControl.setValue(2);
    component.childrenControl.setValue(1);
    component.infantsControl.setValue(0);

    fixture.detectChanges();

    component.onSubmit();

    expect(component.critereSubmit.emit).toHaveBeenCalledWith({
      departureCity: 'Geneve, Suisse',
      destinationCity: 'Zurich, Suisse',
      departureDate: '2024-08-10',
      returnDate: '2024-08-15',
      adults: 2,
      children: 1,
      infants: 0,
      tripType: 'round-trip'
    });
  });

  it('should not emit critereSubmit event when form is invalid', () => {
    spyOn(component.critereSubmit, 'emit');

    component.departureControl.setValue('');
    component.destinationControl.setValue('');
    component.departureDateControl.setValue('');

    fixture.detectChanges();

    component.onSubmit();

    expect(component.critereSubmit.emit).not.toHaveBeenCalled();
  });
});
