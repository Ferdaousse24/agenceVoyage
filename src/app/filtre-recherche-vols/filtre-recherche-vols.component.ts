import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-filtre-recherche-vols',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtre-recherche-vols.component.html',
  styleUrls: ['./filtre-recherche-vols.component.css']
})
export class FiltreRechercheVolsComponent {
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

  departure = this.cities[0].code;
  destination = '';
  tripType = 'one-way';
  showAdditionalFields = false;

  departureDate: string = '';
  returnDate: string = '';
  adults: number = 1;
  children: number = 0;
  
  today: string = new Date().toISOString().split('T')[0];

  getFilteredCities() {
    return this.cities.filter(city => city.code !== this.departure);
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
