import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recuperation-vols',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recuperation-vols.component.html',
  styleUrls: ['./recuperation-vols.component.css']
})
export class RecuperationVolsComponent {
  @Input() flights: any[] = [];
  @Input() departure!: string;
  @Input() destination!: string;
  @Input() departureDate!: string;
  @Input() returnDate!: string;
  @Input() tripType!: string;
  @Input() adults!: number;
  @Input() children!: number;
  @Output() selectedFlightChange = new EventEmitter<any>();

  selectedFlight: any = null;
  selectedIndex: number = 0;

  selectFlight(flight: any, index: number) {
    this.selectedFlight = flight;
    this.selectedIndex = index;
    this.selectedFlightChange.emit(flight);
  }

  navigate(step: number) {
    const newIndex = this.selectedIndex + step;
    if (newIndex >= 0 && newIndex < this.flights.length) {
      this.selectFlight(this.flights[newIndex], newIndex);
    }
  }
}
