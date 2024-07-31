import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  styleUrls: ['./recuperation-vols.component.css']
})
export class RecuperationVolsComponent implements OnChanges {
  @Input() flights: Flight[] = [];
  @Input() returnFlights: Flight[] = [];
  @Input() departure!: string;
  @Input() destination!: string;
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['flights'] && this.flights.length > 0) {
      console.log("Received flights: ", this.flights);
      this.selectDefaultFlight();
    }
    if (changes['returnFlights'] && this.returnFlights.length > 0) {
      console.log("Received return flights: ", this.returnFlights);
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
    const middleIndex = 3; 
    const departureDateString = new Date(this.departureDate).toISOString().split('T')[0];
    const selectedFlightIndex = this.flights.findIndex(f => new Date(f.date).toISOString().split('T')[0] === departureDateString);
    
    if (selectedFlightIndex !== -1) {
      this.selectFlight(this.flights[selectedFlightIndex], selectedFlightIndex);
    } else {
      this.selectFlight(this.flights[middleIndex], middleIndex);
    }
  }

  selectDefaultReturnFlight() {
    const middleIndex = 3;
    const selectedReturnFlightIndex = this.returnFlights.findIndex(f => f.date.split('T')[0] === this.returnDate.split('T')[0]);
    this.selectReturnFlight(this.returnFlights[selectedReturnFlightIndex !== -1 ? selectedReturnFlightIndex : middleIndex], selectedReturnFlightIndex !== -1 ? selectedReturnFlightIndex : middleIndex);
  }

  handleFlightSelection(flight: Flight, index: number) {
    this.selectedDepartureFlight = flight;
    this.selectedIndex = index;
  }

  handleReturnFlightSelection(flight: Flight, index: number) {
    this.selectedReturnFlight = flight;
    this.selectedReturnIndex = index;
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
      totalPrice = parseFloat(this.selectedDepartureFlight.price as any) + parseFloat(this.selectedReturnFlight.price as any) + 40;
    } else if (this.selectedDepartureFlight) {
      totalPrice = parseFloat(this.selectedDepartureFlight.price as any) + 40;
    }

    return totalPrice;
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
}
