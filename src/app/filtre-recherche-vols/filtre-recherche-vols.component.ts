import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-filtre-recherche-vols',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatAutocompleteModule, MatInputModule, MatSnackBarModule],
  templateUrl: './filtre-recherche-vols.component.html',
  styleUrls: ['./filtre-recherche-vols.component.css']
})
export class FiltreRechercheVolsComponent implements OnInit {
  @ViewChild('flightDetails') flightDetails!: ElementRef;
  @ViewChild('flightForm') flightForm!: NgForm;

  cities = [
    { code: 'GVA', name: 'Geneve, Suisse' },
    { code: 'ZRH', name: 'Zurich, Suisse' },
    { code: 'LYS', name: 'Lyon, France' },
    { code: 'MRS', name: 'Marseille, France' },
    { code: 'PAR', name: 'Paris, France' },
    { code: 'MLH', name: 'Mulhouse, France' },
    { code: 'TLS', name: 'Toulouse, France' },
    { code: 'MPL', name: 'Montpellier, France' },
    { code: 'NCE', name: 'Nice, France' },
    { code: 'BOD', name: 'Bordeaux, France' },
    // Ajoutez toutes les autres villes du fichier CSV de la même manière
  ];

  departureControl = new FormControl();
  destinationControl = new FormControl();
  departure = '';
  destination = '';
  tripType = 'one-way';
  showAdditionalFields = false;
  departureError = '';
  destinationError = '';

  departureDate: string = '';
  returnDate: string = '';
  adults: number = 1;
  children: number = 0;
  
  today: string = new Date().toISOString().split('T')[0];

  filteredOptions!: Observable<any[]>;
  filteredDestinationOptions!: Observable<any[]>;

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.filteredOptions = this.departureControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterOptions(value, 'departure'))
    );

    this.filteredDestinationOptions = this.destinationControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterOptions(value, 'destination'))
    );

    this.departureControl.valueChanges.subscribe(value => {
      this.departure = this.getCityCode(value);
      this.updateFilteredOptions();
    });

    this.destinationControl.valueChanges.subscribe(value => {
      this.destination = this.getCityCode(value);
      this.updateFilteredOptions();
      this.onDestinationChange(); // Met à jour l'affichage des champs additionnels
    });
  }

  filterOptions(value: string, type: string): any[] {
    const filterValue = value.toLowerCase();
    return this.cities.filter(option => {
      const match = option.name.toLowerCase().includes(filterValue);
      if (type === 'departure') {
        return match && option.code !== this.destination;
      } else {
        return match && option.code !== this.departure;
      }
    });
  }

  getCityCode(cityName: string): string {
    const city = this.cities.find(c => c.name === cityName);
    return city ? city.code : '';
  }

  updateFilteredOptions() {
    this.filteredOptions = of(this.filterOptions(this.departureControl.value, 'departure'));
    this.filteredDestinationOptions = of(this.filterOptions(this.destinationControl.value, 'destination'));
  }

  onDepartureSelected(event: any) {
    this.departure = this.getCityCode(event.option.value);
    this.updateFilteredOptions();
  }

  onDestinationSelected(event: any) {
    this.destination = this.getCityCode(event.option.value);
    this.updateFilteredOptions();
  }

  onDestinationChange() {
    this.showAdditionalFields = !!this.destination;
  }

  onTripTypeChange() {
    if (this.tripType === 'one-way') {
      this.returnDate = '';
    }
  }

  toggleFields() {
    this.showAdditionalFields = !this.showAdditionalFields;
  }

  onSubmit() {
    this.departureError = '';
    this.destinationError = '';

    const departureCity = this.cities.find(city => city.name === this.departureControl.value);
    const destinationCity = this.cities.find(city => city.name === this.destinationControl.value);

    if (!departureCity) {
      this.departureError = 'La ville de départ n\'est pas valide.';
      this.showError(this.departureError);
      return;
    }

    if (this.departure === this.destination) {
      this.destinationError = 'La ville de départ ne peut pas être la même que la ville d\'arrivée.';
      this.showError(this.destinationError);
      return;
    }

    if (this.tripType === 'round-trip' && this.returnDate <= this.departureDate) {
      this.destinationError = 'La date de retour doit être supérieure à la date de départ.';
      this.showError(this.destinationError);
      return;
    }

    console.log('Recherche de vol :', {
      departure: this.departure,
      destination: this.destination,
      tripType: this.tripType,
      departureDate: this.departureDate,
      returnDate: this.returnDate,
      adults: this.adults,
      children: this.children
    });
    this.displayFlightDetails();
  }

  showError(message: string) {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
    });
  }

  displayFlightDetails() {
    const details = `
      Départ: ${this.departure},
      Destination: ${this.destination},
      Date de départ: ${this.departureDate},
      Date de retour: ${this.tripType === 'round-trip' ? this.returnDate : 'N/A'},
      Nombre d'adultes: ${this.adults},
      Nombre d'enfants: ${this.children}
    `;
    this.flightDetails.nativeElement.innerText = details;
  }
}
