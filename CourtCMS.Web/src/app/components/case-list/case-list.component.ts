import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CaseService } from '../../services/case.service';
import { Case } from '../../models/case.model';
import { CaseFormModalComponent, CaseFormData } from '../case-form-modal/case-form-modal.component';

@Component({
  selector: 'app-case-list',
  standalone: true,
  imports: [CommonModule, RouterModule, CaseFormModalComponent],
  templateUrl: './case-list.component.html',
  styleUrl: './case-list.component.scss',
})
export class CaseListComponent implements OnInit {
  cases: Case[] = [];
  judges: { id: number; fullName: string }[] = [];

  // --- COMPUTED STATS ---
  // Getters are recalculated every time Angular checks for changes.
  get totalCases(): number {
    return this.cases.length;
  }

  get openCases(): number {
    return this.cases.filter((c) => c.status === 'Open').length;
  }

  get closedCases(): number {
    return this.cases.filter((c) => c.status === 'Closed').length;
  }

  // --- MODAL STATE ---
  isModalOpen = false;
  selectedCase: Case | null = null;

  constructor(
    private caseService: CaseService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.caseService.getCases().subscribe({
      next: (data) => {
        this.cases = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching cases:', err);
      },
    });

    this.caseService.getJudges().subscribe({
      next: (data) => {
        this.judges = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching judges:', err),
    });
  }

  // --- MODAL CONTROLS ---

  openCreateModal(): void {
    this.selectedCase = null;
    this.isModalOpen = true;
  }

  openEditModal(courtCase: Case): void {
    this.selectedCase = courtCase;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedCase = null;
  }

  // --- CRUD OPERATIONS ---

  // The modal emits CaseFormData. This method figures out whether
  // to call Create or Update based on whether a case was selected.
  onCaseSave(formData: CaseFormData): void {
    if (this.selectedCase) {
      this.updateCase(this.selectedCase.id, formData);
    } else {
      this.createCase(formData);
    }
  }

  private createCase(formData: CaseFormData): void {
    const createRequest = {
      caseNumber: formData.caseNumber,
      title: formData.title,
      assignedJudgeId: formData.assignedJudgeId,
    };

    this.caseService.createCase(createRequest).subscribe({
      next: (createdCase) => {
        // Add to top of list so the newest case appears first
        this.cases.unshift(createdCase);
        this.closeModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creating case:', err);
        alert('Failed to create case. Please try again.');
      },
    });
  }

  private updateCase(id: number, formData: CaseFormData): void {
    const updateData = {
      caseNumber: formData.caseNumber,
      title: formData.title,
      assignedJudgeId: formData.assignedJudgeId,
      status: formData.status ?? 'Open',
    };

    this.caseService.updateCase(id, updateData).subscribe({
      next: () => {
        // Optimistic update: apply changes to local data immediately
        const caseToUpdate = this.cases.find((c) => c.id === id);

        if (caseToUpdate) {
          caseToUpdate.caseNumber = formData.caseNumber;
          caseToUpdate.title = formData.title;
          caseToUpdate.assignedJudgeId = formData.assignedJudgeId ?? undefined;
          caseToUpdate.status = formData.status ?? caseToUpdate.status;

          // Look up the judge name from our local judges array
          // so the card immediately reflects the new judge
          const selectedJudge = this.judges.find((j) => j.id === formData.assignedJudgeId);
          if (selectedJudge) {
            caseToUpdate.assignedJudgeName = selectedJudge.fullName;
          }
        }

        this.closeModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Update failed:', err);
        alert('Failed to update case. Please try again.');
      },
    });
  }

  closeCase(courtCase: Case): void {
    const updateData = {
      caseNumber: courtCase.caseNumber,
      title: courtCase.title,
      assignedJudgeId: courtCase.assignedJudgeId ?? null,
      status: 'Closed',
    };

    this.caseService.updateCase(courtCase.id, updateData).subscribe({
      next: () => {
        courtCase.status = 'Closed';
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error closing case:', err),
    });
  }

  deleteCase(courtCase: Case): void {
    const isConfirmed = confirm(
      `Are you sure you want to delete Case ${courtCase.caseNumber}?\n\nThis action cannot be undone.`,
    );

    if (!isConfirmed) return;

    this.caseService.deleteCase(courtCase.id).subscribe({
      next: () => {
        this.cases = this.cases.filter((c) => c.id !== courtCase.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting case:', err);
        alert('Could not delete case. Check console for details.');
      },
    });
  }
}
