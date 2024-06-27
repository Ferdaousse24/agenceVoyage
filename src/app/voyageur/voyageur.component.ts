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
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  phone: string = '';
  passportNumber: string = '';
  nationality: string = '';

  onSubmit() {
    // Logique pour gérer la soumission du formulaire
    const voyageurInfo = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      passportNumber: this.passportNumber,
      nationality: this.nationality
    };

    console.log('Informations Voyageur:', voyageurInfo);
    // Vous pouvez également émettre ces détails au composant parent si nécessaire
  }
}
