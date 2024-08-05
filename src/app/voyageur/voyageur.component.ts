import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AirtableService } from '../services/airtable.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-voyageur',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './voyageur.component.html',
  styleUrls: ['./voyageur.component.css']
})
export class VoyageurComponent implements OnInit {
  @Input() departure!: string;
  @Input() destination!: string;
  @Input() dateDeparture!: string; // Utilisation de string pour la liaison avec l'input date
  @Input() dateRetour!: string; // Utilisation de string pour la liaison avec l'input date
  @Input() tripType!: string; // Ajout de l'input tripType
  @Input() isLastPassenger: boolean = false; // Ajout pour indiquer si c'est le dernier passager
  @Input() formGroup!: FormGroup; // FormGroup en entrée
  bebeForm: FormGroup;

  nationalities: string[] = ['Française', 'Canadienne', 'Américaine', 'Algérienne', 'Marocaine'];
  filteredNationalities: string[] = [];
  filteredNationalitiesBebe: string[] = []; // Ajout pour le filtre de nationalité du bébé
  maxBirthDate: string = new Date().toISOString().split('T')[0]; // Définir la date maximale comme aujourd'hui

  @Output() formValid = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private airtableService: AirtableService) {
    this.bebeForm = this.fb.group({
      voyagerAvec: ['', Validators.required],
      prenomBebe: ['', Validators.required],
      nomBebe: ['', Validators.required],
      nationaliteBebe: ['', Validators.required],
      dateNaissanceBebe: ['', Validators.required]
    });
  }

  ngOnInit() {
    console.log(`Initial Dates: dateDeparture=${this.dateDeparture}, dateRetour=${this.dateRetour}, tripType=${this.tripType}`);
  }

  onSubmitBebe() {
    if (this.bebeForm.valid) {
      const bebeInfo = {
        records: [
          {
            fields: {
              userId: uuidv4(),
              voyagerAvec: this.bebeForm.get('voyagerAvec')?.value,
              prenom: this.bebeForm.get('prenomBebe')?.value,
              nom: this.bebeForm.get('nomBebe')?.value,
              nationalite: this.bebeForm.get('nationaliteBebe')?.value,
              dateNaissance: this.bebeForm.get('dateNaissanceBebe')?.value,
              VilleDepart: this.departure,
              villeDestination: this.destination,
              dateDepart: this.dateDeparture,
              dateRetour: this.tripType === 'round-trip' ? this.dateRetour : null,
              allerRetour: this.tripType === 'round-trip'
            }
          }
        ]
      };

      console.log('Bébé Info à envoyer:', bebeInfo);

      this.airtableService.createRecord(bebeInfo).then(response => {
        console.log('Informations Bébé enregistrées:', response);
        this.formValid.emit(); // Emit formValid event
      }).catch(error => {
        console.error('Erreur lors de l\'enregistrement des informations:', error);
      });
    }
  }

  onSubmit() {
    if (this.formGroup.valid) {
      const voyageurInfo = {
        records: [
          {
            fields: {
              userId: uuidv4(),
              VilleDepart: this.departure,
              villeDestination: this.destination,
              dateDepart: this.formatDate(new Date(this.dateDeparture)),
              dateRetour: this.tripType === 'round-trip' ? this.formatDate(new Date(this.dateRetour)) : null,
              allerRetour: this.tripType === 'round-trip',
              ...this.formGroup.value
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
    }
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  filterNationalities(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    if (input) {
      this.filteredNationalities = this.nationalities.filter(n =>
        n.toLowerCase().includes(input.toLowerCase())
      );
    } else {
      this.filteredNationalities = [];
    }
  }

  filterNationalitiesBebe(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    if (input) {
      this.filteredNationalitiesBebe = this.nationalities.filter(n =>
        n.toLowerCase().includes(input.toLowerCase())
      );
    } else {
      this.filteredNationalitiesBebe = [];
    }
  }

  selectNationality(nationality: string) {
    this.formGroup.patchValue({ nationalite: nationality });
    this.filteredNationalities = [];
  }

  selectNationalityBebe(nationality: string) {
    this.bebeForm.patchValue({ nationaliteBebe: nationality });
    this.filteredNationalitiesBebe = [];
  }
}