import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CaseParty } from '../models/case.model';

@Injectable({
  providedIn: 'root',
})
export class CasePartyService {
  private getBaseUrl(caseId: number): string {
    return `/api/cases/${caseId}/parties`;
  }

  constructor(private http: HttpClient) {}

  // POST: /api/cases/{caseId}/parties
  addPartyToCase(caseId: number, data: { partyId: number; role: string }): Observable<CaseParty> {
    return this.http.post<CaseParty>(this.getBaseUrl(caseId), data);
  }

  // DELETE: /api/cases/{caseId}/parties/{partyId}
  removePartyFromCase(caseId: number, partyId: number): Observable<void> {
    return this.http.delete<void>(`${this.getBaseUrl(caseId)}/${partyId}`);
  }
}
