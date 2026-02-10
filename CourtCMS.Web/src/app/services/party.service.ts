import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Party, CreatePartyRequest } from '../models/case.model';

@Injectable({
  providedIn: 'root',
})
export class PartyService {
  private apiUrl = '/api/parties';

  constructor(private http: HttpClient) {}

  getParties(): Observable<Party[]> {
    return this.http.get<Party[]>(this.apiUrl);
  }

  createParty(party: CreatePartyRequest): Observable<Party> {
    return this.http.post<Party>(this.apiUrl, party);
  }

  updateParty(id: number, party: CreatePartyRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, party);
  }

  deleteParty(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
