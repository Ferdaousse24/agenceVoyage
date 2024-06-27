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
  @Input() departure!: string;
  @Input() destination!: string;
  @Input() departureDate!: string;
  @Input() returnDate!: string;
  @Input() tripType!: string;
  @Input() adults!: number;
  @Input() children!: number;
  @Output() selectedFlightChange = new EventEmitter<Flight>();
  @Output() flightSelected = new EventEmitter<void>();  // Nouvel événement pour la sélection du vol

  selectedFlight: Flight | null = null;
  selectedIndex: number = 0;
  filteredFlights: Flight[] = [];
  weekDaysFlights: Flight[] = [];
  currentDate: Date = new Date();
  today: Date = new Date();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['flights'] && changes['flights'].currentValue.length > 0) {
      this.filterFlights();
    }
  }

  filterFlights() {
    const flightsByDate: { [key: string]: Flight } = {};

    for (const flight of this.flights) {
      const date = flight.date.split('T')[0]; // assuming date is in ISO format

      if (!flightsByDate[date] || flight.price < flightsByDate[date].price) {
        flightsByDate[date] = flight;
      }
    }

    const sortedFlights = Object.values(flightsByDate).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    this.filteredFlights = sortedFlights;
    this.updateWeekDaysFlights();
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

    // Set initial selected flight
    if (this.weekDaysFlights.length > 0) {
      this.selectFlight(this.weekDaysFlights[0], 0);
    }
  }

  selectFlight(flight: Flight, index: number) {
    this.selectedFlight = flight;
    this.selectedIndex = index;
    this.selectedFlightChange.emit(flight);
  }

  onFlightSelected() {
    if (this.selectedFlight) {
      this.flightSelected.emit();  // Émettre l'événement de sélection du vol
    }
  }

  navigateDays(step: number) {
    this.currentDate.setDate(this.currentDate.getDate() + step);
    this.updateWeekDaysFlights();
  }

  isAtStartDate(): boolean {
    const currentDateWithoutTime = new Date(this.currentDate);
    currentDateWithoutTime.setHours(0, 0, 0, 0);
    const todayWithoutTime = new Date(this.today);
    todayWithoutTime.setHours(0, 0, 0, 0);
    return currentDateWithoutTime <= todayWithoutTime;
  }
}
