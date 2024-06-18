import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FiltreRechercheVolsComponent } from '../filtre-recherche-vols/filtre-recherche-vols.component';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css'],
  standalone: true,
  imports: [CommonModule, FiltreRechercheVolsComponent],
})
export class AccueilComponent implements AfterViewInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const menuToggle = document.getElementById('menu-toggle');
      const navbar = document.getElementById('navbar');

      if (menuToggle && navbar) {
        menuToggle.addEventListener('click', () => {
          console.log('Menu toggle clicked');
          navbar.classList.toggle('active');
          console.log('Navbar classes:', navbar.className);
        });
      }
    }
  }
}
