import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Hearing } from '../models/case.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HearingService {
  // Base URL for hearings API - hearings must belong to a case
  // This produces URLs like: /api/cases/3/hearings
  private getBaseUrl(caseId: number): string {
    return `${environment.apiBaseUrl}/api/cases/${caseId}/hearings`;
  }

  constructor(private http: HttpClient) {}

  // POST: /api/cases/{caseId}/hearings
  createHearing(
    caseId: number,
    hearing: { description: string; hearingDate: string; location: string },
  ): Observable<Hearing> {
    return this.http.post<Hearing>(this.getBaseUrl(caseId), hearing);
  }

  // PUT: /api/cases/{caseId}/hearings/{hearingId}
  updateHearing(
    caseId: number,
    hearingId: number,
    hearing: { description: string; hearingDate: string; location: string },
  ): Observable<void> {
    return this.http.put<void>(`${this.getBaseUrl(caseId)}/${hearingId}`, hearing);
  }

  // DELETE: /api/cases/{caseId}/hearings/{hearingId}
  deleteHearing(caseId: number, hearingId: number): Observable<void> {
    return this.http.delete<void>(`${this.getBaseUrl(caseId)}/${hearingId}`);
  }
}
