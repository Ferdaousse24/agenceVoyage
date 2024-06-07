import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiltreRechercheVolsComponent } from '../filtre-recherche-vols/filtre-recherche-vols.component';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css'],
  standalone: true,
  imports: [CommonModule, FiltreRechercheVolsComponent],
})
export class AccueilComponent {}
