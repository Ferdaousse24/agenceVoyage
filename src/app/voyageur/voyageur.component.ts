import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AirtableService } from '../services/airtable.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-voyageur',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './voyageur.component.html',
  styleUrls: ['./voyageur.component.css']
})
export class VoyageurComponent implements OnInit {
  @Input() departure!: string;
  @Input() destination!: string;
  @Input() dateDeparture!: string; // Utilisation de string pour la liaison avec l'input date
  @Input() dateRetour!: string; // Utilisation de string pour la liaison avec l'input date
  @Input() tripType!: string; // Ajout de l'input tripType
  title: string = '';
  firstName: string = '';
  lastName: string = '';
  nationality: string = '';
  birthDate: string = '';
  passportNumber: string = '';
  phoneNumber: string = ''; // Ajout du champ phoneNumber
  email: string = ''; // Ajout du champ email
  emailInvalid: boolean = false; // Ajout du flag pour email invalide
  passportNumberInvalid: boolean = false;
  nationalities: string[] = ['Française', 'Canadienne', 'Américaine', 'Algérienne', 'Marocaine'];
  filteredNationalities: string[] = [];
  maxBirthDate: string = new Date().toISOString().split('T')[0]; // Définir la date maximale comme aujourd'hui

  @Output() formValid = new EventEmitter<void>();

  constructor(private airtableService: AirtableService) {}

  ngOnInit() {
    console.log(`Initial Dates: dateDeparture=${this.dateDeparture}, dateRetour=${this.dateRetour}, tripType=${this.tripType}`);
  }

  onSubmit() {
    this.passportNumberInvalid = !this.validatePassportNumber(this.passportNumber);
    this.emailInvalid = !this.validateEmail(this.email);

    if (!this.passportNumberInvalid && !this.emailInvalid) {
      const formattedDateDeparture = this.dateDeparture ? this.formatDate(new Date(this.dateDeparture)) : '';
      const formattedDateRetour = (this.tripType === 'round-trip' && this.dateRetour) ? this.formatDate(new Date(this.dateRetour)) : null;
      const formattedBirthDate = this.birthDate ? this.formatDate(new Date(this.birthDate)) : '';

      if (!formattedDateDeparture || (this.tripType === 'round-trip' && !formattedDateRetour) || !formattedBirthDate) {
        console.error('Dates invalides');
        return;
      }

      const voyageurInfo = {
        records: [
          {
            fields: {
              userId: uuidv4(), 
              VilleDepart: this.departure,
              villeDestination: this.destination,
              dateDepart: formattedDateDeparture,
              dateRetour: this.tripType === 'round-trip' ? formattedDateRetour : null,
              allerRetour: this.tripType === 'round-trip',
              titre: this.title,
              prenom: this.firstName,
              nom: this.lastName,
              nationalite: this.nationality,
              dateNaissance: formattedBirthDate,
              numeroPasseport: this.passportNumber,
              telephone: this.phoneNumber, // Ajout du champ telephone
              email: this.email // Ajout du champ email
            }
          }
        ]
      };

      console.log('Voyageur Info à envoyer:', voyageurInfo);

      this.airtableService.createRecord(voyageurInfo).then(response => {
        console.log('Informations Voyageur enregistrées:', response);
        this.formValid.emit(); // Emit formValid event
      }).catch(error => {
        console.error('Erreur lors de l\'enregistrement des informations:', error);
      });
    } else {
      if (this.passportNumberInvalid) {
        console.log('Numéro de passeport invalide:', this.passportNumber);
      }
      if (this.emailInvalid) {
        console.log('Email invalide:', this.email);
      }
    }
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  formatDate(date: Date): string {
    if (!date) {
      console.error('Date is undefined or null');
      return '';
    }
    return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
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
