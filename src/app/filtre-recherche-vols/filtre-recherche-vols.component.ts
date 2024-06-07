import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filtre-recherche-vols',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtre-recherche-vols.component.html',
  styleUrls: ['./filtre-recherche-vols.component.css']
})
export class FiltreRechercheVolsComponent {
  cities = [
    { code: 'NYC', name: 'New York' },
    { code: 'PAR', name: 'Paris' },
    { code: 'LON', name: 'London' },
    { code: 'BER', name: 'Berlin' },
    { code: 'TOK', name: 'Tokyo' },
    { code: 'SYD', name: 'Sydney' },
    { code: 'ROM', name: 'Rome' },
    { code: 'AMS', name: 'Amsterdam' },
    { code: 'BCN', name: 'Barcelona' },
    { code: 'MEX', name: 'Mexico City' }
  ];

  departure = this.cities[0].code;
  destination = '';
  tripType = 'one-way';
  showAdditionalFields = false;

  departureDate: string = '';
  returnDate: string = '';
  adults: number = 1;
  children: number = 0;

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
    console.log('Recherche de vol :', {
      departure: this.departure,
      destination: this.destination,
      tripType: this.tripType,
      departureDate: this.departureDate,
      returnDate: this.returnDate,
      adults: this.adults,
      children: this.children
    });
  }
}
