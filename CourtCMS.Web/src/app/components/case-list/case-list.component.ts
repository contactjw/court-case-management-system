import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize, forkJoin, timer } from 'rxjs';
import { CaseService } from '../../services/case.service';
import { ToastService } from '../../services/toast.service';
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
  isSaving = false;

  constructor(
    private caseService: CaseService,
    private toastService: ToastService,
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
    this.isSaving = false;
    this.isModalOpen = true;
  }

  openEditModal(courtCase: Case): void {
    this.selectedCase = courtCase;
    this.isSaving = false;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedCase = null;
    this.isSaving = false;
  }

  // --- CRUD OPERATIONS ---

  onCaseSave(formData: CaseFormData): void {
    if (this.isSaving) return;
    this.isSaving = true;

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

    forkJoin({
      api: this.caseService.createCase(createRequest),
      delay: timer(500), // Minimum 0.5 second (use 1000 for 1 second, 2000 for 2 seconds, etc.)
    })
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: ({ api: createdCase }) => {
          // ← Destructure to get the API result
          this.isSaving = false;
          this.cases.unshift(createdCase);
          this.closeModal();
          this.toastService.success(`Case ${createdCase.caseNumber} filed successfully.`);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSaving = false;
          console.error('Error creating case:', err);
          this.toastService.error('Failed to create case. Please try again.');
          this.cdr.detectChanges();
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

    // forkJoin waits for BOTH to complete.
    // If the API takes 50ms, we still wait the full 1000ms.
    // If the API takes 3000ms, we don't add any extra delay.
    forkJoin({
      api: this.caseService.updateCase(id, updateData),
      delay: timer(500), // Minimum 0.5 second (use 1000 for 1 second, 2000 for 2 seconds, etc.)
    })
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.isSaving = false;

          const selectedJudge = this.judges.find((j) => j.id === formData.assignedJudgeId);
          const judgeName = selectedJudge ? selectedJudge.fullName : 'Unassigned';

          const caseToUpdate = this.cases.find((c) => c.id === id);
          if (caseToUpdate) {
            caseToUpdate.caseNumber = formData.caseNumber;
            caseToUpdate.title = formData.title;
            caseToUpdate.assignedJudgeId = formData.assignedJudgeId ?? undefined;
            caseToUpdate.status = formData.status ?? caseToUpdate.status;
            caseToUpdate.assignedJudgeName = judgeName;
          }

          if (this.selectedCase) {
            this.selectedCase = {
              ...this.selectedCase,
              caseNumber: formData.caseNumber,
              title: formData.title,
              assignedJudgeId: formData.assignedJudgeId ?? undefined,
              status: formData.status ?? this.selectedCase.status,
              assignedJudgeName: judgeName,
            };
          }

          this.closeModal(); // Comment this line out if we want to keep the modal open after saving
          this.toastService.success(`Case ${formData.caseNumber} updated successfully.`);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSaving = false;
          console.error('Update failed:', err);
          this.toastService.error('Failed to update case. Please try again.');
          this.cdr.detectChanges();
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
        this.toastService.success(`Case ${courtCase.caseNumber} closed.`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error closing case:', err);
        this.toastService.error('Failed to close case. Please try again.');
      },
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
        this.toastService.success(`Case ${courtCase.caseNumber} deleted.`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting case:', err);
        this.toastService.error('Could not delete case. Please try again.');
      },
    });
  }
}
