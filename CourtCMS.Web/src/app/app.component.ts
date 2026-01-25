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
    assignedJudgeId: 1,
  };

  judges = [
    { id: 1, name: 'Judy Scheindlin' },
    { id: 2, name: 'Joseph Wapner' },
    { id: 3, name: 'Marilyn Milian' },
  ];

  statuses = ['Open', 'Closed', 'Suspended'];

  // We inject the Service (to talk to API) and the ChangeDetector (to refresh screen)
  constructor(
    private caseService: CaseService,
    private cdr: ChangeDetectorRef,
  ) {}

  // 1. Load data when the app starts
  ngOnInit(): void {
    this.caseService.getCases().subscribe({
      next: (data) => {
        this.cases = data;
        this.cdr.detectChanges(); // <--- Force refresh after loading
      },
      error: (err) => {
        console.error('Error fetching cases:', err);
      },
    });
  }

  // 2. Create a new case when the button is clicked
  createCase(): void {
    this.caseService.createCase(this.newCaseModel).subscribe({
      next: (createdCase) => {
        console.log('Case created successfully:', createdCase);

        // Add the new case to the list
        this.cases.push(createdCase);

        // Clear the form
        this.newCaseModel = { caseNumber: '', title: '', assignedJudgeId: 1 };

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
          courtCase.assignedJudgeName = selectedJudge.name;
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
