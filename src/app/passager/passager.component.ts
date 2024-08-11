import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-passager',
  templateUrl: './passager.component.html',
  styleUrls: ['./passager.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class PassagerComponent implements OnInit {
  @Input() adultsCount: number = 0;
  @Input() childrenCount: number = 0;
  @Input() infantsCount: number = 0;
  @Output() voyageursSubmit = new EventEmitter<any>();

  voyageursFormGroups: FormGroup[] = [];
  selectedVoyageurIndex: number = 0;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeVoyageurs();
  }

  initializeVoyageurs(): void {
    this.voyageursFormGroups = this.createPassengerForms();
  }

  createPassengerForms(): FormGroup[] {
    const forms: FormGroup[] = [];

    for (let i = 0; i < this.adultsCount; i++) {
      forms.push(this.createPassengerForm('Adulte'));
    }
    for (let i = 0; i < this.childrenCount; i++) {
      forms.push(this.createPassengerForm('Enfant'));
    }
    for (let i = 0; i < this.infantsCount; i++) {
      forms.push(this.createPassengerForm('Bébé'));
    }

    return forms;
  }

  createPassengerForm(type: string): FormGroup {
    return this.fb.group({
      type: [type],
      titre: ['', Validators.required],
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      nationalite: ['', Validators.required],
      dateNaissance: ['', Validators.required],
      numeroPasseport: ['', Validators.required],
      telephone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  selectVoyageur(index: number): void {
    this.selectedVoyageurIndex = index;
  }

  onNext(): void {
    if (this.voyageursFormGroups[this.selectedVoyageurIndex].valid) {
      if (this.selectedVoyageurIndex < this.voyageursFormGroups.length - 1) {
        this.selectVoyageur(this.selectedVoyageurIndex + 1);
      } else {
        this.onSubmit();
      }
    }
  }

  onSubmit(): void {
    const allVoyageurs = this.voyageursFormGroups.map(form => form.value);
    console.log('allVoyageurs: ', allVoyageurs)
    this.voyageursSubmit.emit(allVoyageurs);
  }
}
