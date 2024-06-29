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
  @Output() selectedFlightChange = new EventEmitter<Flight>();
  @Output() flightSelected = new EventEmitter<{ totalPrice: number }>();

  selectedDepartureFlight: Flight | null = null;
  selectedReturnFlight: Flight | null = null;
  selectedIndex: number = 0;
  selectedReturnIndex: number = 0;
  filteredFlights: Flight[] = [];
  filteredReturnFlights: Flight[] = [];
  weekDaysFlights: Flight[] = [];
  returnWeekDaysFlights: Flight[] = [];
  currentDate: Date = new Date();
  returnCurrentDate: Date = new Date();
  today: Date = new Date();
  selectedDate: string = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['flights'] && changes['flights'].currentValue.length > 0) {
      this.filterFlights();
      this.selectedDate = this.departureDate.split('T')[0]; // Set the selected date to departureDate
    }

    if (changes['returnFlights'] && changes['returnFlights'].currentValue.length > 0) {
      this.filterReturnFlights();
      this.selectedDate = this.returnDate.split('T')[0]; // Set the selected date to returnDate
    }
  }

  filterFlights() {
    const flightsByDate: { [key: string]: Flight } = {};

    for (const flight of this.flights) {
      const date = flight.date.split('T')[0];

      if (!flightsByDate[date] || flight.price < flightsByDate[date].price) {
        flightsByDate[date] = flight;
      }
    }

    const sortedFlights = Object.values(flightsByDate).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    this.filteredFlights = sortedFlights;
    this.updateWeekDaysFlights();
  }

  filterReturnFlights() {
    const returnFlightsByDate: { [key: string]: Flight } = {};

    for (const flight of this.returnFlights) {
      const date = flight.date.split('T')[0];

      if (!returnFlightsByDate[date] || flight.price < returnFlightsByDate[date].price) {
        returnFlightsByDate[date] = flight;
      }
    }

    const sortedReturnFlights = Object.values(returnFlightsByDate).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    this.filteredReturnFlights = sortedReturnFlights;
    this.updateReturnWeekDaysFlights();
  }

  updateWeekDaysFlights() {
    this.weekDaysFlights = [];
    const startDate = new Date(this.currentDate);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      const dayString = day.toISOString().split('T')[0];
      const flight = this.filteredFlights.find(f => f.date.split('T')[0] === dayString);
      if (flight) {
        this.weekDaysFlights.push(flight);
      } else {
        this.weekDaysFlights.push({
          departureCode: this.departure,
          destinationCode: this.destination,
          date: dayString,
          price: NaN,
          available: false,
          stops: null
        });
      }
    }

    if (this.weekDaysFlights.length > 0) {
      const selectedFlightIndex = this.weekDaysFlights.findIndex(f => f.date.split('T')[0] === this.departureDate.split('T')[0]);
      this.selectFlight(this.weekDaysFlights[selectedFlightIndex] || this.weekDaysFlights[0], selectedFlightIndex !== -1 ? selectedFlightIndex : 0);
    }
  }

  updateReturnWeekDaysFlights() {
    this.returnWeekDaysFlights = [];
    const startDate = new Date(this.returnCurrentDate);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      const dayString = day.toISOString().split('T')[0];
      const flight = this.filteredReturnFlights.find(f => f.date.split('T')[0] === dayString);
      if (flight) {
        this.returnWeekDaysFlights.push(flight);
      } else {
        this.returnWeekDaysFlights.push({
          departureCode: this.destination,
          destinationCode: this.departure,
          date: dayString,
          price: NaN,
          available: false,
          stops: null
        });
      }
    }

    if (this.returnWeekDaysFlights.length > 0) {
      const selectedReturnFlightIndex = this.returnWeekDaysFlights.findIndex(f => f.date.split('T')[0] === this.returnDate.split('T')[0]);
      this.selectReturnFlight(this.returnWeekDaysFlights[selectedReturnFlightIndex] || this.returnWeekDaysFlights[0], selectedReturnFlightIndex !== -1 ? selectedReturnFlightIndex : 0);
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

  scrollToSelectedDate() {
    setTimeout(() => {
      const selectedElement = document.getElementById(`flight-${this.selectedDate}`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 0);
  }

  navigateDays(step: number) {
    this.currentDate.setDate(this.currentDate.getDate() + step);
    this.updateWeekDaysFlights();
  }

  navigateReturnDays(step: number) {
    this.returnCurrentDate.setDate(this.returnCurrentDate.getDate() + step);
    this.updateReturnWeekDaysFlights();
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
