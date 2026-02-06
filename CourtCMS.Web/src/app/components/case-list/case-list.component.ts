import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CaseService } from '../../services/case.service';
import { Case, CreateCaseRequest } from '../../models/case.model';

@Component({
  selector: 'app-case-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './case-list.component.html',
  styleUrl: './case-list.component.scss',
})
export class CaseListComponent implements OnInit {
  title = 'Court Case Management System';
  cases: Case[] = [];

  newCaseModel: CreateCaseRequest = {
    caseNumber: '',
    title: '',
    assignedJudgeId: null,
  };

  judges: any[] = [];
  statuses = ['Open', 'Closed', 'Suspended'];

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

  createCase(): void {
    this.caseService.createCase(this.newCaseModel).subscribe({
      next: (createdCase) => {
        console.log('Case created successfully:', createdCase);
        this.cases.unshift(createdCase);
        this.newCaseModel = { caseNumber: '', title: '', assignedJudgeId: null };
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creating case:', err);
      },
    });
  }

  closeCase(courtCase: Case): void {
    const updateData = {
      caseNumber: courtCase.caseNumber,
      title: courtCase.title,
      assignedJudgeId: courtCase.assignedJudgeId,
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

    if (!isConfirmed) {
      return;
    }

    this.caseService.deleteCase(courtCase.id).subscribe({
      next: () => {
        this.cases = this.cases.filter((c) => c.id !== courtCase.id);
        console.log('Case deleted (soft delete)');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting case:', err);
        alert('Could not delete case. Check console for details.');
      },
    });
  }

  enableEdit(courtCase: Case): void {
    courtCase.isEditing = true;
  }

  cancelEdit(courtCase: Case): void {
    courtCase.isEditing = false;
  }

  saveCase(courtCase: Case): void {
    const updateData = {
      caseNumber: courtCase.caseNumber,
      title: courtCase.title,
      status: courtCase.status,
      assignedJudgeId: courtCase.assignedJudgeId,
    };

    this.caseService.updateCase(courtCase.id, updateData).subscribe({
      next: () => {
        const selectedJudge = this.judges.find((j) => j.id == courtCase.assignedJudgeId);
        if (selectedJudge) {
          courtCase.assignedJudgeName = selectedJudge.fullName;
        }

        console.log('Case updated successfully');
        courtCase.isEditing = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Update failed', err);
        alert('Failed to update case');
      },
    });
  }
}
