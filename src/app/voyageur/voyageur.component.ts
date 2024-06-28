import { Component, EventEmitter, Output } from '@angular/core';
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
  nationalities: string[] = ['Française', 'Canadienne', 'Américaine', 'Algérienne', 'Marocaine'];
  filteredNationalities: string[] = [];
  maxBirthDate: string = new Date().toISOString().split('T')[0]; // Définir la date maximale comme aujourd'hui

  @Output() formValid = new EventEmitter<void>();

  onSubmit() {
    this.passportNumberInvalid = !this.validatePassportNumber(this.passportNumber);

    if (!this.passportNumberInvalid) {
      const voyageurInfo = {
        title: this.title,
        firstName: this.firstName,
        lastName: this.lastName,
        nationality: this.nationality,
        birthDate: this.birthDate,
        passportNumber: this.passportNumber
      };

      console.log('Informations Voyageur:', voyageurInfo);

      // Emit formValid event
      this.formValid.emit();
    } else {
      console.log('Numéro de passeport invalide:', this.passportNumber);
    }
  }

  filterNationalities(event: Event) {
    const input = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredNationalities = this.nationalities.filter(n => n.toLowerCase().includes(input));
  }

  selectNationality(nationality: string) {
    this.nationality = nationality;
    this.filteredNationalities = [];
  }

  validatePassportNumber(passportNumber: string): boolean {
    const passportRegex = /^[0-9A-Z]{9}$/;
    const isValid = passportRegex.test(passportNumber);
    console.log(`Validating passport number: ${passportNumber}, isValid: ${isValid}`);
    return isValid;
  }
}
