import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CaseService } from '../../services/case.service';
import { CaseDetail } from '../../models/case.model';

@Component({
  selector: 'app-case-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './case-details.component.html',
  styleUrl: './case-details.component.scss',
})
export class CaseDetailsComponent implements OnInit {
  caseData?: CaseDetail;
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private caseService: CaseService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Extract the case ID from the URL
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id && !isNaN(id)) {
      this.loadCaseDetails(id);
    } else {
      this.errorMessage = 'Invalid case ID';
      this.isLoading = false;
    }
  }

  loadCaseDetails(id: number): void {
    this.caseService.getCaseById(id).subscribe({
      next: (data) => {
        this.caseData = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching case details:', err);
        this.errorMessage = 'Could not load case details. Please ensure the backend is running.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
