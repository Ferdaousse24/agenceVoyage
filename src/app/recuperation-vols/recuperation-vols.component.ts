import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';

interface Flight {
  departureCode: string;
  destinationCode: string;
  date: string;
  price: number;
  available: boolean;
  stops: number | null;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
}

@Component({
  selector: 'app-recuperation-vols',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recuperation-vols.component.html',
  styleUrls: ['./recuperation-vols.component.css'],
  providers: [{ provide: LOCALE_ID, useValue: 'fr' }]
})
export class RecuperationVolsComponent implements  OnChanges {
  @Input() flights: Flight[] = [];
  @Input() returnFlights: Flight[] = [];
  @Input() departure!: string;
  @Input() destination!: string;
  @Input() departureName!: string;
  @Input() destinationName!: string;
  @Input() departureDate!: string;
  @Input() returnDate!: string;
  @Input() tripType!: string;
  @Input() adults!: number;
  @Input() children!: number;
  @Input() infants!: number;
  @Output() selectedFlightChange = new EventEmitter<Flight>();
  @Output() flightSelected = new EventEmitter<{ totalPrice: number }>();

  selectedDepartureFlight: Flight | null = null;
  selectedReturnFlight: Flight | null = null;
  selectedIndex: number = 0;
  selectedReturnIndex: number = 0;
  currentDate: Date = new Date();
  returnCurrentDate: Date = new Date();
  today: Date = new Date();
  selectedDate: string = '';

  agencyFee: number = 40;  // Ajoutez les frais d'agence ici

  ngOnChanges(changes: SimpleChanges) {
    if (changes['flights'] && this.flights && this.flights.length === 7) {
      this.selectDefaultFlight();
    }
    if (changes['returnFlights'] && this.returnFlights && this.returnFlights.length === 7) {
      this.selectDefaultReturnFlight();
    }
    if (changes['departureDate'] && changes['departureDate'].currentValue) {
      this.currentDate = new Date(this.departureDate);
    }
    if (changes['returnDate'] && changes['returnDate'].currentValue) {
      this.returnCurrentDate = new Date(this.returnDate);
    }
  }

  selectFlight(flight: Flight, index: number) {
    this.selectedDepartureFlight = flight;
    this.selectedIndex = index;
    this.selectedFlightChange.emit(flight);
  }

  selectReturnFlight(flight: Flight, index: number) {
    this.selectedReturnFlight = flight;
    this.selectedReturnIndex = index;
    this.selectedFlightChange.emit(flight);
  }

  selectDefaultFlight() {
    const selectedDepartureDate = new Date(this.departureDate).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
    const dayAfterTomorrow = new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0];
    const threeDaysLater = new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0];
  
    let defaultFlightIndex = -1;
    if (selectedDepartureDate === today && new Date(this.flights[0].date).toISOString().split('T')[0] === selectedDepartureDate) {
      defaultFlightIndex = 0;
    } else if (selectedDepartureDate === tomorrow && new Date(this.flights[1].date).toISOString().split('T')[0] === selectedDepartureDate) {
      defaultFlightIndex = 1;
    } else if (selectedDepartureDate === dayAfterTomorrow && new Date(this.flights[2].date).toISOString().split('T')[0] === selectedDepartureDate) {
      defaultFlightIndex = 2;
    } else if (new Date(selectedDepartureDate).getTime() >= new Date(threeDaysLater).getTime() && this.flights.length > 3 && new Date(this.flights[3].date).toISOString().split('T')[0] === selectedDepartureDate) {
      defaultFlightIndex = 3;
    } else {
      // Si aucune correspondance exacte n'est trouvée, choisissez le vol le plus proche
      let closestDateDiff = Infinity;
      this.flights.forEach((flight, index) => {
        const flightDate = new Date(flight.date).toISOString().split('T')[0];
        const dateDiff = Math.abs(new Date(flightDate).getTime() - new Date(selectedDepartureDate).getTime());
        if (dateDiff < closestDateDiff) {
          closestDateDiff = dateDiff;
          defaultFlightIndex = index;
        }
      });
    }
  
    if (defaultFlightIndex !== -1) {
      this.selectFlight(this.flights[defaultFlightIndex], defaultFlightIndex);
    }
  }
  

  selectDefaultReturnFlight() {
    const selectedReturnDate = new Date(this.returnDate).toISOString().split('T')[0];

    let defaultReturnFlightIndex = this.returnFlights.findIndex(flight => {
      const flightDate = new Date(flight.date).toISOString().split('T')[0];
      return flightDate === selectedReturnDate;
    });

    if (defaultReturnFlightIndex === -1) {
      // Si aucune correspondance exacte n'est trouvée, choisissez le vol le plus proche
      let closestDateDiff = Infinity;
      this.returnFlights.forEach((flight, index) => {
        const flightDate = new Date(flight.date).toISOString().split('T')[0];
        const dateDiff = Math.abs(new Date(flightDate).getTime() - new Date(selectedReturnDate).getTime());
        if (dateDiff < closestDateDiff) {
          closestDateDiff = dateDiff;
          defaultReturnFlightIndex = index;
        }
      });
    }

    if (defaultReturnFlightIndex !== -1) {
      this.selectReturnFlight(this.returnFlights[defaultReturnFlightIndex], defaultReturnFlightIndex);
    }
  }

  handleFlightSelection(flight: Flight, index: number) {
    this.selectFlight(flight, index);
  }

  handleReturnFlightSelection(flight: Flight, index: number) {
    this.selectReturnFlight(flight, index);
  }

  onFlightSelected() {
    if (this.tripType === 'one-way' && !this.selectedDepartureFlight) {
      return;
    }

    if (this.tripType === 'round-trip' && (!this.selectedDepartureFlight || !this.selectedReturnFlight)) {
      return;
    }

    const totalPrice = this.calculateTotalPrice();
    this.flightSelected.emit({ totalPrice });
  }

  calculateTotalPrice(): number {
    let totalPrice = 0;

    if (this.selectedDepartureFlight && this.selectedReturnFlight) {
      totalPrice = parseFloat(this.selectedDepartureFlight.price as any) + parseFloat(this.selectedReturnFlight.price as any) + (this.agencyFee*2);
    } else if (this.selectedDepartureFlight) {
      totalPrice = parseFloat(this.selectedDepartureFlight.price as any) + this.agencyFee;
    }

    return parseFloat(totalPrice.toFixed(2));
  }

  navigateDays(step: number) {
    this.currentDate.setDate(this.currentDate.getDate() + step);
  }

  navigateReturnDays(step: number) {
    this.returnCurrentDate.setDate(this.returnCurrentDate.getDate() + step);
  }

  isAtStartDate(): boolean {
    const currentDateWithoutTime = new Date(this.currentDate);
    currentDateWithoutTime.setHours(0, 0, 0, 0);
    const todayWithoutTime = new Date(this.today);
    todayWithoutTime.setHours(0, 0, 0, 0);
    return currentDateWithoutTime <= todayWithoutTime;
  }

  isSelectedDepartureFlight(index: number): boolean {
    return this.selectedIndex === index;
  }

  isSelectedReturnFlight(index: number): boolean {
    return this.selectedReturnIndex === index;
  }

  formatDuration(duration?: string): string {
    if (!duration) {
      return 'Durée inconnue';
    }
  
    // Remove the 'PT' prefix
    duration = duration.replace('PT', '');
  
    // Extract hours and minutes
    const hoursMatch = duration.match(/(\d+)H/);
    const minutesMatch = duration.match(/(\d+)M/);
  
    const hours = hoursMatch ? hoursMatch[1] : '0';
    const minutes = minutesMatch ? minutesMatch[1] : '0';
  
    return `${hours} heures et ${minutes} minutes`;
  }
  
  
}