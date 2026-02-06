import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Case, CreateCaseRequest, CaseDetail } from '../models/case.model';

@Injectable({
  providedIn: 'root',
})
export class CaseService {
  // The proxy we set up earlier forwards '/api' to 'http://localhost:5196/api'
  private apiUrl = '/api/cases';

  constructor(private http: HttpClient) {}

  // Fetch list of cases for viewing (lightweight)
  getCases(): Observable<Case[]> {
    return this.http.get<Case[]>(this.apiUrl);
  }

  getCaseById(id: number): Observable<CaseDetail> {
    return this.http.get<CaseDetail>(`${this.apiUrl}/${id}`);
  }

  // Fetch list of active judges
  getJudges(): Observable<any[]> {
    return this.http.get<any[]>('/api/judges');
  }

  createCase(newCase: CreateCaseRequest): Observable<Case> {
    return this.http.post<Case>(this.apiUrl, newCase);
  }

  updateCase(id: number, caseData: any): Observable<any> {
    const url = `${this.apiUrl}/${id}`; // creates '/api/cases/1'
    return this.http.put(url, caseData);
  }

  // DELETE: Trigger the soft delete on the backend
  deleteCase(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
