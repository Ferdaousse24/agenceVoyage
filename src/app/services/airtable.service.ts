import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class AirtableService {
  private accessToken = 'patRlJ077H181mgww.dece4863cc1b362ff4e0edee12dcbfa141a8ed76eb50bcbbf937d86d2de3bbce';
  private baseId = 'appV1On9FZzTOxnSn'; 
  private tableName = 'reservation'; 
  private apiUrl = `https://api.airtable.com/v0/${this.baseId}/${this.tableName}`;

  constructor() { }

  async createRecord(record: any) {
    try {
      const response = await axios.post(this.apiUrl, record, {
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
}
