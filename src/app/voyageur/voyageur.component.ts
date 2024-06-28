import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-voyageur',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './voyageur.component.html',
  styleUrls: ['./voyageur.component.css']
})
export class VoyageurComponent {
  title: string = '';
  firstName: string = '';
  lastName: string = '';
  nationality: string = '';
  birthDate: string = '';
  passportNumber: string = '';
  passportNumberInvalid: boolean = false;
  nationalities: string[] = ['Française', 'Canadienne', 'Américaine', 'Algérienne', 'Marocaine']; // Ajouter d'autres nationalités
  filteredNationalities: string[] = [];

  onSubmit() {
    // Logique pour gérer la soumission du formulaire
    const voyageurInfo = {
      title: this.title,
      firstName: this.firstName,
      lastName: this.lastName,
      nationality: this.nationality,
      birthDate: this.birthDate,
      passportNumber: this.passportNumber
    };

    console.log('Informations Voyageur:', voyageurInfo);
    // Vous pouvez également émettre ces détails au composant parent si nécessaire
  }

  filterNationalities(event: Event) {
    const input = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredNationalities = this.nationalities.filter(n => n.toLowerCase().includes(input));
  }

  selectNationality(nationality: string) {
    this.nationality = nationality;
    this.filteredNationalities = [];
  }
}
