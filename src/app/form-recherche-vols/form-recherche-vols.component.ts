import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

interface City {
  name: string;
  code: string;
}

@Component({
  selector: 'app-form-recherche-vols',
  templateUrl: './form-recherche-vols.component.html',
  styleUrls: ['./form-recherche-vols.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule
  ]
})
export class FormRechercheVolsComponent implements OnInit {
  @Input() cities: City[] = [];  // Liste des villes, fournie par le composant parent
  @Output() critereSubmit: EventEmitter<any> = new EventEmitter<any>(); // Emission de l'objet critere

  departureControl = new FormControl('', Validators.required);
  destinationControl = new FormControl('', Validators.required);
  tripTypeControl = new FormControl('round-trip', Validators.required);
  departureDateControl = new FormControl('', Validators.required);
  returnDateControl = new FormControl('', Validators.required);
  adultsControl = new FormControl(1, [Validators.required, Validators.min(1)]);
  childrenControl = new FormControl(0);
  infantsControl = new FormControl(0);

  filteredOptions!: Observable<City[]>;
  filteredDestinationOptions!: Observable<City[]>;

  today = new Date().toISOString().split('T')[0]; // Date d'aujourd'hui pour la validation
  showAdditionalFields = false;

  constructor() {}

  ngOnInit() {
    this.filteredOptions = this.departureControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value, this.cities))
    );

    this.filteredDestinationOptions = this.destinationControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterDestination(value))
    );

    this.departureControl.valueChanges.subscribe(() => {
      this.checkFormCompletion();
      this.updateReturnDateMin();
    });

    this.destinationControl.valueChanges.subscribe(() => {
      this.checkFormCompletion();
    });
  }

  private _filter(value: string | null, options: City[]): City[] {
    const filterValue = (value || '').toLowerCase();
    return options.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  private _filterDestination(value: string | null): City[] {
    const filterValue = (value || '').toLowerCase();
    return this.cities
      .filter(city => city.name.toLowerCase().includes(filterValue))
      .filter(city => city.name !== this.departureControl.value);
  }

  onDepartureSelected(event: any) {
    this.destinationControl.setValue('');
    this.filteredDestinationOptions = this.destinationControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterDestination(value))
    );
  }

  onTripTypeChange() {
    if (this.tripTypeControl.value === 'one-way') {
      this.returnDateControl.reset(); // Réinitialiser la date de retour si le type est aller simple
    }
    this.showAdditionalFields = true;
  }

  onDepartureDateChange() {
    this.updateReturnDateMin();
  }

  onReturnDateChange() {
    const returnValue = this.returnDateControl.value;
    const departureValue = this.departureDateControl.value;

    if (returnValue && departureValue) {
      const returnDate = new Date(returnValue);
      const departureDate = new Date(departureValue);

      // Vérifiez que la date de retour est bien après la date de départ
      if (returnDate <= departureDate) {
        this.returnDateControl.setErrors({ invalidReturnDate: true });
      } else {
        this.returnDateControl.setErrors(null); // Clear any existing errors
      }
    }
  }

  updateReturnDateMin() {
    const departureValue = this.departureDateControl.value;
    if (departureValue) {
      const departureDate = new Date(departureValue);
      const minReturnDate = new Date(departureDate);
      minReturnDate.setDate(departureDate.getDate() + 1);
      const minReturnDateString = minReturnDate.toISOString().split('T')[0];
      this.returnDateControl.setValue(''); // Réinitialiser la date de retour
      this.returnDateControl.setValidators([Validators.required, Validators.min(minReturnDate.getTime())]);
      this.returnDateControl.updateValueAndValidity();
      // Update the min attribute on the return date input field
      document.getElementById('returnDate')?.setAttribute('min', minReturnDateString);
    }
  }

  checkFormCompletion() {
    if (this.departureControl.valid && this.destinationControl.valid) {
      this.showAdditionalFields = true;
    } else {
      this.showAdditionalFields = false;
    }
  }

  onContinue() {
    if (
      this.departureControl.valid &&
      this.destinationControl.valid &&
      this.departureDateControl.valid &&
      (this.tripTypeControl.value === 'one-way' || this.returnDateControl.valid) &&
      this.adultsControl.valid
    ) {
      const departureCity = this.cities.find(city => city.name === this.departureControl.value);
      const destinationCity = this.cities.find(city => city.name === this.destinationControl.value);

      const critere = {
        departureCity: departureCity || { name: '', code: '' },
        destinationCity: destinationCity || { name: '', code: '' },
        departureDate: this.departureDateControl.value,
        returnDate: this.returnDateControl.value,
        adults: this.adultsControl.value,
        children: this.childrenControl.value,
        infants: this.infantsControl.value,
        tripType: this.tripTypeControl.value
      };
      this.critereSubmit.emit(critere);
    } else {
      console.error('Formulaire invalide');
    }
  }

  toggleFields() {
    this.showAdditionalFields = !this.showAdditionalFields;
  }
}
