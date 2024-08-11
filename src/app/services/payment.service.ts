import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'https://your-api-url/payment'; // Remplacez par l'URL de votre API de paiement

  constructor() { }

  async processPayment(paiement: any, reservationNumber: string): Promise<any> {
    try {
      const response = await axios.post(`${this.apiUrl}/process`, {
        paymentDetails: paiement,
        reservationNumber: reservationNumber
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }
}
