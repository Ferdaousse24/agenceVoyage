import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PaymentComponent {
  @Input() totalAmount: number = 0; // Montant total à payer
  @Output() paymentSubmit = new EventEmitter<any>(); // Événement pour soumettre le paiement

  paymentDetails = {
    cardNumber: '',
    cardHolder: '',
    expirationDate: '',
    cvv: ''
  };

  onSubmitPayment(): void {
    if (this.isFormValid()) {
      this.paymentSubmit.emit(this.paymentDetails); // Émettre les détails de paiement
    } else {
      alert('Veuillez remplir tous les champs du formulaire.');
    }
  }

  isFormValid(): boolean {
    return (
      this.paymentDetails.cardNumber.length === 16 &&
      this.paymentDetails.cardHolder !== '' &&
      this.paymentDetails.expirationDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/) !== null &&
      this.paymentDetails.cvv.length === 3
    );
  }
}
