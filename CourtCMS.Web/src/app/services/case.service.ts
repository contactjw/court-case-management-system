import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Case, CreateCaseRequest, CaseDetail } from '../models/case.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CaseService {
  private apiUrl = `${environment.apiBaseUrl}/api/cases`;

  constructor(private http: HttpClient) {}

  getCases(): Observable<Case[]> {
    return this.http.get<Case[]>(this.apiUrl);
  }

  getCaseById(id: number): Observable<CaseDetail> {
    return this.http.get<CaseDetail>(`${this.apiUrl}/${id}`);
  }

  getJudges(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/api/judges`);
  }

  createCase(newCase: CreateCaseRequest): Observable<Case> {
    return this.http.post<Case>(this.apiUrl, newCase);
  }

  updateCase(id: number, caseData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, caseData);
  }

  deleteCase(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
