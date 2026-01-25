import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Case, CreateCaseRequest } from '../models/case.model';

@Injectable({
  providedIn: 'root',
})
export class CaseService {
  // The proxy we set up earlier forwards '/api' to 'http://localhost:5196/api'
  private apiUrl = '/api/cases';

  constructor(private http: HttpClient) {}

  getCases(): Observable<Case[]> {
    return this.http.get<Case[]>(this.apiUrl);
  }

  createCase(newCase: CreateCaseRequest): Observable<Case> {
    return this.http.post<Case>(this.apiUrl, newCase);
  }
}
