import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paiement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paiement.component.html',
  styleUrls: ['./paiement.component.css']
})
export class PaiementComponent {
  redirectToPayment() {
    window.location.href = 'https://pay-pro.monetico.fr/izysafar/paiement';
  }
}
