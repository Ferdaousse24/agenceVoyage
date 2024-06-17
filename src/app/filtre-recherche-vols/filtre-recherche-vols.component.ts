import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-filtre-recherche-vols',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatAutocompleteModule, MatInputModule],
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

  departureDate: string = '';
  returnDate: string = '';
  adults: number = 1;
  children: number = 0;
  
  today: string = new Date().toISOString().split('T')[0];

  filteredOptions!: Observable<any[]>;
  filteredDestinationOptions!: Observable<any[]>;

  ngOnInit() {
    this.filteredOptions = this.departureControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterDepartureOptions(value))
    );

    this.filteredDestinationOptions = this.destinationControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterDestinationOptions(value))
    );

    this.departureControl.valueChanges.subscribe(value => {
      this.departure = this.getCityCode(value);
      this.filteredDestinationOptions = of(this.filterDestinationOptions(this.destinationControl.value));
    });

    this.destinationControl.valueChanges.subscribe(value => {
      this.destination = this.getCityCode(value);
      this.onDestinationChange(); // Met à jour l'affichage des champs additionnels
      this.filteredOptions = of(this.filterDepartureOptions(this.departureControl.value));
    });
  }

  filterDepartureOptions(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.cities.filter(option => 
      option.name.toLowerCase().includes(filterValue) && option.code !== this.destination
    );
  }

  filterDestinationOptions(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.cities.filter(option => 
      option.name.toLowerCase().includes(filterValue) && option.code !== this.departure
    );
  }

  getCityCode(cityName: string): string {
    const city = this.cities.find(c => c.name === cityName);
    return city ? city.code : '';
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
    this.departure = this.getCityCode(this.departureControl.value);
    this.destination = this.getCityCode(this.destinationControl.value);

    if (this.tripType === 'round-trip' && this.returnDate <= this.departureDate) {
      alert('La date de retour doit être supérieure à la date de départ.');
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
