import { Component, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-voyageur',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './voyageur.component.html',
  styleUrls: ['./voyageur.component.css']
})
export class VoyageurComponent {
  @Input() departure!: string;
  @Input() destination!: string;
  @Input() dateDeparture!: string;
  @Input() dateRetour!: string;
  @Input() tripType!: string;
  @Input() isLastPassenger: boolean = false;
  @Input() formGroup!: FormGroup;

  nationalities: string[] = ['Française', 'Canadienne', 'Américaine', 'Algérienne', 'Marocaine'];
  filteredNationalities: string[] = [];
  maxBirthDate: string = new Date().toISOString().split('T')[0];

  @Output() formValid = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() savePassenger = new EventEmitter<any>();

  constructor(private fb: FormBuilder) {}

  onNext() {
    this.savePassengerData();
    this.next.emit();
  }

  savePassengerData() {
    if (this.formGroup.valid) {
      const passengerInfo = {
        type: this.formGroup.get('type')?.value,
        titre: this.formGroup.get('titre')?.value,
        prenom: this.formGroup.get('prenom')?.value,
        nom: this.formGroup.get('nom')?.value,
        nationalite: this.formGroup.get('nationalite')?.value,
        dateNaissance: this.formGroup.get('dateNaissance')?.value,
        numeroPasseport: this.formGroup.get('numeroPasseport')?.value,
        telephone: this.formGroup.get('telephone')?.value,
        email: this.formGroup.get('email')?.value
      };
      this.savePassenger.emit(passengerInfo);
    }
  }

  async onSubmit() {
    if (this.formGroup.valid) {
      this.savePassengerData();
      if (this.isLastPassenger) {
        try {
          this.formValid.emit();
        } catch (error) {
          console.error('Erreur lors de l\'enregistrement des informations:', error);
        }
      } else {
        this.formValid.emit();
        this.onNext();
      }
    }
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

  selectNationality(nationality: string) {
    this.formGroup.patchValue({ nationalite: nationality });
    this.filteredNationalities = [];
  }
}