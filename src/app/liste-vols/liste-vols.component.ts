import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { formatDuration } from '../utils/duration-formatter';

interface City {
  code: string;
  name: string;
}

interface TravelerPricing {
  travelerType: string;
  price: {
    currency: string;
    total: string;
    base: string;
  };
  cabin: string;
  fareBasis: string;
  brandedFare?: string;
  class: string;
}

interface Segment {
  departure: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  carrierCode: string;
  number: string;
  aircraft: string;
  duration: string;
  numberOfStops: number;
  travelers: TravelerPricing[];
}

interface Vol {
  departure: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  carrierCode: string;
  number: string;
  aircraft: string;
  duration: string;
  numberOfStops: number;
  price: {
    currency: string;
    total: string;
    base: string;
  };
  travelers: TravelerPricing[];
}

interface Criteres {
  departureCity: City;
  destinationCity: City;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  tripType: 'one-way' | 'round-trip';
}

interface Vols {
  volsAlle: Vol[];
  volsRetour: Vol[];
}

interface Parcours {
  critere: Criteres;
  vols: Vols;
  voyageurs?: any;
}

@Component({
  selector: 'app-liste-vols',
  templateUrl: './liste-vols.component.html',
  styleUrls: ['./liste-vols.component.css'],
  standalone: true, 
  imports: [CommonModule]
})
export class ListeVolsComponent implements OnInit {
  @Input() parcours: Parcours = {
    critere: {
      departureCity: { name: '', code: '' },
      destinationCity: { name: '', code: '' },
      departureDate: '',
      returnDate: '',
      adults: 1,
      children: 0,
      infants: 0,
      tripType: 'one-way'
    },
    vols: {
      volsAlle: [],
      volsRetour: []
    },
    voyageurs: null
  };

  @Output() volChoisi = new EventEmitter<number[]>(); // Émission des indices des vols choisis

  selectedIndices: number[] = [-1, -1]; // [index du vol aller, index du vol retour]
  
  departureCityName: string = '';
  destinationCityName: string = '';
  tripType: string = '';

  ngOnInit() {
    // Préparer les données pour le template HTML
    this.departureCityName = this.parcours.critere?.departureCity?.name || 'Ville de départ';
    this.destinationCityName = this.parcours.critere?.destinationCity?.name || 'Ville de destination';
    this.tripType = this.parcours.critere?.tripType || 'one-way';

    // Sélection automatique du vol aller basé sur la date de départ
    const allerIndex = this.parcours.vols.volsAlle.findIndex(vol => this.isSameDate(vol.departure.at, this.parcours.critere.departureDate));
    if (allerIndex !== -1) {
        this.selectedIndices[0] = allerIndex;
    }

    // Sélection automatique du vol retour basé sur la date de retour si applicable
    if (this.tripType === 'round-trip' && this.parcours.critere.returnDate) {
        const retourIndex = this.parcours.vols.volsRetour.findIndex(vol => this.isSameDate(vol.departure.at, this.parcours.critere.returnDate as string));
        if (retourIndex !== -1) {
            this.selectedIndices[1] = retourIndex;
        }
    }
}

// Méthode pour comparer les dates
isSameDate(volDate: string, critereDate: string): boolean {
    const volDateObj = new Date(volDate);
    const critereDateObj = new Date(critereDate);
    return volDateObj.getFullYear() === critereDateObj.getFullYear() &&
           volDateObj.getMonth() === critereDateObj.getMonth() &&
           volDateObj.getDate() === critereDateObj.getDate();
}


  

  get selectedDepartureVol(): Vol | null {
    return this.selectedIndices[0] !== -1 && this.parcours.vols.volsAlle.length > 0 
      ? this.parcours.vols.volsAlle[this.selectedIndices[0]] 
      : null;
  }

  get selectedReturnVol(): Vol | null {
    return this.selectedIndices[1] !== -1 && this.parcours.vols.volsRetour.length > 0 
      ? this.parcours.vols.volsRetour[this.selectedIndices[1]] 
      : null;
  }

  isSelectedDepartureVol(index: number): boolean {
    return this.selectedIndices[0] === index;
  }

  isSelectedReturnVol(index: number): boolean {
    return this.selectedIndices[1] === index;
  }

  handleVolSelection(index: number): void {
    this.selectedIndices[0] = index;
  }

  handleReturnVolSelection(index: number): void {
    this.selectedIndices[1] = index;
  }

  calculateTotalPrice(): number {
    const departurePrice = this.selectedDepartureVol ? parseFloat(this.selectedDepartureVol.price.total) : 0;
    const returnPrice = this.selectedReturnVol ? parseFloat(this.selectedReturnVol.price.total) : 0;
    const totalPrice = departurePrice + returnPrice;
    return parseFloat(totalPrice.toFixed(2)); // Convertir le résultat en un nombre avec 2 décimales
  }

  onVolSelected(): void {
    this.volChoisi.emit(this.selectedIndices);
  }

  formatDuration(duration: string): string {
    return formatDuration(duration);
  }
}
