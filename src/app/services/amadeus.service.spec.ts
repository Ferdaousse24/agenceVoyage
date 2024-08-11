import { TestBed } from '@angular/core/testing';
import { AmadeusService } from './amadeus.service';
import axios from 'axios';

describe('AmadeusService', () => {
  let service: AmadeusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AmadeusService]
    });
    service = TestBed.inject(AmadeusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch the token successfully', async () => {
    const tokenResponse = {
      access_token: 'test_token',
      token_type: 'Bearer',
      expires_in: 3600
    };

    spyOn(axios, 'post').and.returnValue(Promise.resolve({ data: tokenResponse }));

    await service['getToken']();

    expect(axios.post).toHaveBeenCalledWith(
      'https://test.api.amadeus.com/v1/security/oauth2/token',
      jasmine.any(Object),
      jasmine.any(Object)
    );
    expect(service['token']).toEqual('test_token');
  });

  it('should handle error while fetching the token', async () => {
    const errorMessage = 'Error fetching token';
    spyOn(axios, 'post').and.returnValue(Promise.reject(new Error(errorMessage)));
  
    try {
      await service['getToken']();
    } catch (error) {
      expect((error as Error).message).toEqual(errorMessage);
    }
  
    expect(axios.post).toHaveBeenCalled();
  });

  it('should search flights successfully', async () => {
    const searchResponse = {
      data: [
        {
          price: { total: '100' },
          itineraries: [{
            duration: 'PT2H',
            segments: [
              {
                departure: { at: '2024-08-10T10:00:00' },
                arrival: { at: '2024-08-10T12:00:00' }
              }
            ]
          }]
        }
      ]
    };

    spyOn(axios, 'get').and.returnValue(Promise.resolve({ data: searchResponse }));
    service['token'] = 'test_token';

    const flights = await service.searchFlights('GVA', 'PAR', '2024-08-10', 1, 0, 0);

    expect(axios.get).toHaveBeenCalledWith(
      'https://test.api.amadeus.com/v2/shopping/flight-offers',
      jasmine.any(Object)
    );
    expect(flights).toEqual(searchResponse);
  });

  it('should handle error while searching flights', async () => {
    const errorMessage = 'Error searching flights';
    spyOn(axios, 'get').and.returnValue(Promise.reject(new Error(errorMessage)));
    service['token'] = 'test_token';

    try {
      await service.searchFlights('GVA', 'PAR', '2024-08-10', 1, 0, 0);
    } catch (error) {
      expect((error as Error).message).toEqual(errorMessage);
    }

    expect(axios.get).toHaveBeenCalled();
  });

  it('should search flights with criteria successfully', async () => {
    const searchResponse = {
      data: [
        {
          price: { total: '100' },
          itineraries: [{
            duration: 'PT2H',
            segments: [
              {
                departure: { at: '2024-08-10T10:00:00' },
                arrival: { at: '2024-08-10T12:00:00' }
              }
            ]
          }]
        }
      ]
    };

    spyOn(axios, 'get').and.returnValue(Promise.resolve({ data: searchResponse }));
    service['token'] = 'test_token';

    const critere = {
      departureCity: 'GVA',
      destinationCity: 'PAR',
      departureDate: '2024-08-10',
      returnDate: '2024-08-17',
      adults: 1,
      children: 0,
      infants: 0,
      tripType: 'round-trip'
    };

    const result = await service.rechercherVolsAvecCritere(critere);

    expect(axios.get).toHaveBeenCalledTimes(14); // 7 for departure, 7 for return
    expect(result.volsAlle.length).toBe(7);
    expect(result.volsRetour.length).toBe(7);
  });

  it('should handle error while searching flights with criteria', async () => {
    const errorMessage = 'Error searching flights with criteria';
    spyOn(axios, 'get').and.returnValue(Promise.reject(new Error(errorMessage)));
    service['token'] = 'test_token';

    const critere = {
      departureCity: 'GVA',
      destinationCity: 'PAR',
      departureDate: '2024-08-10',
      returnDate: '2024-08-17',
      adults: 1,
      children: 0,
      infants: 0,
      tripType: 'round-trip'
    };

    try {
      await service.rechercherVolsAvecCritere(critere);
    } catch (error) {
      expect((error as Error).message).toEqual(errorMessage);
    }

    expect(axios.get).toHaveBeenCalled();
  });

  it('should determine the correct start date for flights', () => {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    const startDateToday = service['determineStartDateForFlights'](today);
    const startDateFuture = service['determineStartDateForFlights'](futureDate.toISOString().split('T')[0]);

    expect(startDateToday.toISOString().split('T')[0]).toEqual(today);
    expect(startDateFuture.toISOString().split('T')[0]).toEqual(
      new Date(futureDate.setDate(futureDate.getDate() - 3)).toISOString().split('T')[0]
    );
  });

  it('should determine the correct start date for return flights', () => {
    const startDateAlle = new Date();
    const startDateRetour = service['determineStartDateForReturnFlights'](startDateAlle);

    expect(startDateRetour.getDate()).toEqual(startDateAlle.getDate() + 1);
  });
});
