import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = 'https://your-api-url/email'; // Remplacez par l'URL de votre API d'envoi d'emails

  constructor() { }

  async sendEmailConfirmation(reservationNumber: string): Promise<any> {
    try {
      const response = await axios.post(`${this.apiUrl}/send-confirmation`, {
        reservationNumber: reservationNumber
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending email confirmation:', error);
      throw error;
    }
  }
}
