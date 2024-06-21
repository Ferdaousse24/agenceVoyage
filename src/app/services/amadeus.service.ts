import { Injectable } from '@angular/core';
import axios from 'axios';
import { environement } from '../../environement/environement';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class AmadeusService {
  private token: string | undefined;

  constructor() {
    this.getToken().then().catch(err => console.error(err));
  }

  private async getToken() {
    try {
      const response = await axios.post('https://test.api.amadeus.com/v1/security/oauth2/token', qs.stringify({
        grant_type: 'client_credentials',
        client_id: environement.amadeus.clientId,
        client_secret: environement.amadeus.clientSecret
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      this.token = response.data.access_token;
    } catch (error) {
      console.error('Error fetching the token:', error);
      throw error;
    }
  }

  public async searchFlights(origin: string, destination: string, departureDate: string) {
    if (!this.token) {
      await this.getToken();
    }

    try {
      const response = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
        headers: {
          Authorization: `Bearer ${this.token}`
        },
        params: {
          originLocationCode: origin,
          destinationLocationCode: destination,
          departureDate: departureDate,
          adults: 1,
          max: 1 // Limite le nombre de résultats à 1
        }
      });

      console.log('API Response:', response.data); // Affiche le retour de l'API dans la console
      return response.data;
    } catch (error) {
      console.error('Error fetching flight offers:', error);
      throw error;
    }
  }
}
