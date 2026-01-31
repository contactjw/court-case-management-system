import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaseService } from './services/case.service';
import { Case, CreateCaseRequest } from './models/case.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule], // We need both modules
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'Court Case Management System';
  cases: Case[] = [];

  // This object holds the form data
  newCaseModel: CreateCaseRequest = {
    caseNumber: '',
    title: '',
    assignedJudgeId: null,
  };

  // judges = [
  //   { id: 1, name: 'Judy Scheindlin' },
  //   { id: 2, name: 'Joseph Wapner' },
  //   { id: 3, name: 'Marilyn Milian' },
  // ];

  judges: any[] = [];

  statuses = ['Open', 'Closed', 'Suspended'];

  // We inject the Service (to talk to API) and the ChangeDetector (to refresh screen)
  constructor(
    private caseService: CaseService,
    private cdr: ChangeDetectorRef,
  ) {}

  // Load data when the app starts for the cases list
  ngOnInit(): void {
    this.loadData();
  }

  // Load data from the Database
  loadData(): void {
    // 1. Fetch cases from /api/cases
    this.caseService.getCases().subscribe({
      next: (data) => {
        this.cases = data;
        // Required for force refresh after loading
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching cases:', err);
      },
    });

    // Fetch Judges from Database
    this.caseService.getJudges().subscribe({
      next: (data) => {
        this.judges = data;

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching judges:', err),
    });
  }

  // --- Actions ---

  createCase(): void {
    this.caseService.createCase(this.newCaseModel).subscribe({
      next: (createdCase) => {
        console.log('Case created successfully:', createdCase);

        // Add the new case to the list
        this.cases.push(createdCase);

        // Clear the form
        this.newCaseModel = { caseNumber: '', title: '', assignedJudgeId: null };

        // Tell Angular to repaint the screen immediately
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creating case:', err);
      },
    });
  }

  // This function runs when the user clicks "Close Case"
  closeCase(courtCase: Case): void {
    // 1. Prepare the updated data
    const updateData = {
      caseNumber: courtCase.caseNumber,
      title: courtCase.title,
      assignedJudgeId: courtCase.assignedJudgeId,
      status: 'Closed',
    };

    // 2. Call the API
    this.caseService.updateCase(courtCase.id, updateData).subscribe({
      next: () => {
        // 3. Update the screen instantly
        courtCase.status = 'Closed';
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error closing case:', err),
    });
  }

  deleteCase(courtCase: Case): void {
    // 1. The Safety Check (Popup)
    const isConfirmed = confirm(
      `Are you sure you want to delete Case ${courtCase.caseNumber}?\n\nThis action cannot be undone.`,
    );

    // 2. If they clicked "Cancel", stop immediately.
    if (!isConfirmed) {
      return;
    }

    // 3. If "OK", call the API
    this.caseService.deleteCase(courtCase.id).subscribe({
      next: () => {
        // 4. Update the UI instantly (Remove it from the array)
        // We filter the list to keep everything EXCEPT the one we just deleted
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

  // 1. Turn on Edit Mode
  enableEdit(courtCase: Case): void {
    courtCase.isEditing = true;
  }

  // 2. Turn off Edit Mode (Revert changes if needed - simplified here)
  cancelEdit(courtCase: Case): void {
    courtCase.isEditing = false;
  }

  // 3. Save Changes
  saveCase(courtCase: Case): void {
    // We need to map the data to match what the API expects
    // Note: For now, we will hardcode Judge ID 1 just to make the Title update work easily.
    // In a real app, we would need a dropdown menu here.
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
        courtCase.isEditing = false; // Turn off edit mode
        this.cdr.detectChanges(); // Refresh screen
      },
      error: (err) => {
        console.error('Update failed', err);
        alert('Failed to update case');
      },
    });
  }
}
