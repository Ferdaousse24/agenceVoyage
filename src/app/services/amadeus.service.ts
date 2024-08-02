import { Injectable } from '@angular/core';
import axios from 'axios';
import { environement } from '../../environement/environement';

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
      const response = await axios.post('https://test.api.amadeus.com/v1/security/oauth2/token', {
        grant_type: 'client_credentials',
        client_id: environement.amadeus.clientId,
        client_secret: environement.amadeus.clientSecret
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      this.token = response.data.access_token;
    } catch (error) {
      const axiosError = error as any; // Assertion de type pour error
      console.error('Error fetching the token:', axiosError.response?.data || axiosError.message || error);
    }
  }

  async searchFlights(departure: string, destination: string, departureDate: string, adults: number) {
    if (!this.token) {
      throw new Error('No token available');
    }
    const response = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
      params: {
        originLocationCode: departure,
        destinationLocationCode: destination,
        departureDate: departureDate,
        adults: adults,
        max: 1,
      },
      headers: {
        Authorization: `Bearer ${this.token}`,
      }
    });
    return response.data;
  }

  async searchFlightsForMultipleDates(departure: string, destination: string, dates: string[], adults: number) {
    if (!this.token) {
      throw new Error('No token available');
    }

    const requests = dates.map(date => 
      axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
        params: {
          originLocationCode: departure,
          destinationLocationCode: destination,
          departureDate: date,
          adults: adults,
          max: 1,
        },
        headers: {
          Authorization: `Bearer ${this.token}`,
        }
      })
    );

    const responses = await Promise.all(requests);

    return responses.map(response => response.data);
  }
}
