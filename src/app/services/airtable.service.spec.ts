import { TestBed } from '@angular/core/testing';
import axios from 'axios';
import { AirtableService } from './airtable.service';

describe('AirtableService', () => {
  let service: AirtableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirtableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  
  it('should fetch cities successfully', async () => {
    const mockResponse = {
      data: {
        records: [
          { fields: { code: 'GVA', name: 'Geneve, Suisse' } },
          { fields: { code: 'ZRH', name: 'Zurich, Suisse' } },
          { fields: { code: 'LYS', name: 'Lyon, France' } },
        ]
      }
    };

    spyOn(axios, 'get').and.returnValue(Promise.resolve(mockResponse));

    const cities = await service.getCities();

    expect(axios.get).toHaveBeenCalledWith(
      `${service['apiUrl']}/Cities`,
      { headers: { Authorization: `Bearer ${service['accessToken']}` } }
    );

    expect(cities).toEqual([
      { code: 'GVA', name: 'Geneve, Suisse' },
      { code: 'ZRH', name: 'Zurich, Suisse' },
      { code: 'LYS', name: 'Lyon, France' },
    ]);
  });

  it('should handle error when fetching cities', async () => {
    const errorMessage = 'Error fetching cities';
    spyOn(axios, 'get').and.returnValue(Promise.reject(new Error(errorMessage)));

    try {
      await service.getCities();
    } catch (error) {
      expect((error as Error).message).toEqual(errorMessage);
    }
  });
});
