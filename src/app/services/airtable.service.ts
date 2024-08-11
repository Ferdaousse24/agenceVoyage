import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable } from 'rxjs';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AirtableService {
  private accessToken = 'patRlJ077H181mgww.dece4863cc1b362ff4e0edee12dcbfa141a8ed76eb50bcbbf937d86d2de3bbce';
  private baseId = 'appV1On9FZzTOxnSn'; 
  private apiUrl = `https://api.airtable.com/v0/${this.baseId}`;

  constructor() { }

  async createRecord(record: any, tableName: string) {
    console.log(tableName);
    console.log(record);
    try {
      const response = await axios.post(`${this.apiUrl}/${tableName}`, record, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating record in Airtable:', error);
      throw error;
    }
  }

  async findRecordByEmail(email: string) {
    try {
      const response = await axios.get(`${this.apiUrl}/Clients`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        },
        params: {
          filterByFormula: `email="${email}"`
        }
      });
      return response.data.records;
    } catch (error) {
      console.error('Error finding record by email in Airtable:', error);
      throw error;
    }
  }

   getCities(): Observable<any[]> {
    return new Observable<any[]>(observer => {
      axios.get(`${this.apiUrl}/Cities`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      })
      .then(response => {
        const cities = response.data.records.map((record: any) => ({
          code: record.fields.code,
          name: record.fields.name
        }));
        observer.next(cities);
        observer.complete();
      })
      .catch(error => {
        observer.error(error);
      });
    });
  }
}
