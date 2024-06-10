import { Component } from '@angular/core';
import { FormulaireReservationComponent } from '../formulaire-reservation/formulaire-reservation.component';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css'],
  standalone: true,
  imports: [FormulaireReservationComponent]
})
export class AccueilComponent {}
