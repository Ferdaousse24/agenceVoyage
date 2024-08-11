import { Injectable } from '@angular/core';
import axios from 'axios';
import { environement } from '../../environement/environement';
import { Vol, Vols } from './vol.interface'; // Assurez-vous que ce chemin est correct
import { coerceBooleanProperty } from '@angular/cdk/coercion';

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

  async searchFlights(departure: string, destination: string, departureDate: string, adults: number, children: number, infants: number) {
    if (!this.token) {
      throw new Error('No token available');
    }
    const response = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
      params: {
        originLocationCode: departure,
        destinationLocationCode: destination,
        departureDate: departureDate,
        adults: adults,
        children: children,
        infants: infants,
        max: 1
      },
      headers: {
        Authorization: `Bearer ${this.token}`,
      }
    });
    
    return response.data;
  }

  async rechercherVolsAvecCritere(critere: any): Promise<Vols> {
    const volsAlle: Vol[] = [];
    const volsRetour: Vol[] = [];

    const startDateAlle = this.determineStartDateForFlights(critere.departureDate);

    // Boucle pour les vols aller
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDateAlle);
      date.setDate(startDateAlle.getDate() + i);
      const alleVols = await this.searchFlights(
        critere.departureCity.code,
        critere.destinationCity.code,
        date.toISOString().split('T')[0], // format YYYY-MM-DD
        critere.adults,
        critere.children,
        critere.infants
      );
      if (alleVols && alleVols.data.length > 0) {
        volsAlle.push(this.transformFlightData(alleVols.data[0]));
      }
    }

    // Si c'est un vol aller-retour, on fait de même pour les vols retour
    if (critere.tripType === 'round-trip') {
      const startDateRetour = this.determineStartDateForReturnFlights(startDateAlle);

      for (let i = 0; i < 7; i++) {
        const date = new Date(startDateRetour);
        date.setDate(startDateRetour.getDate() + i);

        const retourVols = await this.searchFlights(
          critere.destinationCity.code,
          critere.departureCity.code,
          date.toISOString().split('T')[0], // format YYYY-MM-DD
          critere.adults,
          critere.children,
          critere.infants
        );
        if (retourVols && retourVols.data.length > 0) {
          volsRetour.push(this.transformFlightData(retourVols.data[0]));
        }
      }
    }
    return { volsAlle, volsRetour };
  }

  private determineStartDateForFlights(departureDateStr: string): Date {
    const departureDate = new Date(departureDateStr);
    const today = new Date();

    if (departureDate <= today) {
      return today;
    }

    const diffInDays = Math.ceil((departureDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    if (diffInDays <= 3) {
      return today;
    } else {
      const startDate = new Date(departureDate);
      startDate.setDate(departureDate.getDate() - 3);
      return startDate;
    }
  }

  private determineStartDateForReturnFlights(startDateAlle: Date): Date {
    const startDateRetour = new Date(startDateAlle);
    startDateRetour.setDate(startDateRetour.getDate() + 1);
    return startDateRetour;
  }

  private transformFlightData(flightData: any): Vol {
    const itinerary = flightData.itineraries[0];
    const firstSegment = itinerary.segments[0];

    return {
      departure: {
        iataCode: firstSegment.departure.iataCode,
        terminal: firstSegment.departure.terminal,
        at: firstSegment.departure.at
      },
      arrival: {
        iataCode: firstSegment.arrival.iataCode,
        terminal: firstSegment.arrival.terminal,
        at: firstSegment.arrival.at
      },
      carrierCode: firstSegment.carrierCode,
      number: firstSegment.number,
      // Note: We no longer look up the aircraft code in a dictionary, so we use the code directly.
      aircraft: firstSegment.aircraft?.code || 'Unknown Aircraft',
      duration: itinerary.duration,
      numberOfStops: firstSegment.numberOfStops,
      price: {
        currency: flightData.price.currency,
        total: flightData.price.total,
        base: flightData.price.base
      },
      travelers: flightData.travelerPricings.map((traveler: any) => ({
        travelerType: traveler.travelerType,
        price: {
          currency: traveler.price.currency,
          total: traveler.price.total,
          base: traveler.price.base
        },
        cabin: traveler.fareDetailsBySegment[0].cabin,
        fareBasis: traveler.fareDetailsBySegment[0].fareBasis,
        brandedFare: traveler.fareDetailsBySegment[0].brandedFare,
        class: traveler.fareDetailsBySegment[0].class
      }))
    };
 }
}
