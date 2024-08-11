import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  price: Price;
  travelers: TravelerPricing[];
}

interface SelectedVol {
  aller: Vol;
  retour?: Vol;
}

@Component({
  selector: 'app-selected-vols',
  templateUrl: './selected-vols.component.html',
  styleUrls: ['./selected-vols.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SelectedVolsComponent {
  @Input() vols: SelectedVol[] = []; // Liste des vols sélectionnés
  @Input() villes: any[] = []; // Liste des villes (départ et arrivée)
  @Output() confirmDetails = new EventEmitter<void>(); // Émission de l'événement

  termsAccepted: boolean = false;

  calculateTotalPrice(): number {
    let totalPrice = 0;
    this.vols.forEach(vol => {
      totalPrice += parseFloat(vol.aller.price.total);
      if (vol.retour) {
        totalPrice += parseFloat(vol.retour.price.total);
      }
    });
    return parseFloat(totalPrice.toFixed(2));
  }
  

  formatDuration(duration: string): string {
    const hoursMatch = duration.match(/(\d+)H/);
    const minutesMatch = duration.match(/(\d+)M/);
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

    return `${hours}h ${minutes}m`;
  }

  getCityName(iataCode: string): string {
    const city = this.villes.find(ville => ville.code === iataCode);
    return city ? city.name : iataCode;
  }

  calculatePrice(travelers: TravelerPricing[], travelerType: string): number {
    return travelers
        .filter(traveler => traveler.travelerType === travelerType)
        .reduce((total, traveler) => total + parseFloat(traveler.price.total), 0);
  }

  calculatePriceAndCount(travelers: TravelerPricing[], travelerType: string): string {
    const relevantTravelers = travelers.filter(traveler => traveler.travelerType === travelerType);
    const count = relevantTravelers.length;
    if (count === 0) {
        return '';
    }
    const total = relevantTravelers.reduce((sum, traveler) => sum + parseFloat(traveler.price.total), 0);
    const pricePerTraveler = count > 0 ? parseFloat(relevantTravelers[0].price.total) : 0;
    return `${count} x ${pricePerTraveler} EUR = ${total.toFixed(2)} EUR`;
}


  onContinue(): void {
    if (this.termsAccepted) {
      this.confirmDetails.emit(); // Émettre l'événement pour l'orchestrateur
    }
  }

  toggleTermsAccepted(): void {
    this.termsAccepted = !this.termsAccepted;
  }
}
