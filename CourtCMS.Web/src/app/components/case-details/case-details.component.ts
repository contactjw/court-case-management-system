import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CaseService } from '../../services/case.service';
import { HearingService } from '../../services/hearing.service';
import { CaseDetail, Hearing } from '../../models/case.model';
import {
  HearingFormModalComponent,
  HearingFormData,
} from '../hearing-form-modal/hearing-form-modal.component';

@Component({
  selector: 'app-case-details',
  standalone: true,
  imports: [CommonModule, RouterLink, HearingFormModalComponent],
  templateUrl: './case-details.component.html',
  styleUrl: './case-details.component.scss',
})
export class CaseDetailsComponent implements OnInit {
  caseData?: CaseDetail;
  isLoading = true;
  errorMessage = '';

  // --- MODAL STATE ---
  // These properties control the modal's behavior.
  // Think of them as the "remote control" for the modal component.
  isModalOpen = false;

  // When null → modal is in "Add" mode.
  // When populated → modal is in "Edit" mode with this hearing's data.
  selectedHearing: Hearing | null = null;

  constructor(
    private route: ActivatedRoute,
    private caseService: CaseService,
    private hearingService: HearingService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
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

  // --- MODAL CONTROLS ---

  // Opens the modal in "Add" mode (no hearing data to pre-fill)
  openAddHearingModal(): void {
    this.selectedHearing = null;
    this.isModalOpen = true;
  }

  // Opens the modal in "Edit" mode (pre-filled with the selected hearing)
  openEditHearingModal(hearing: Hearing): void {
    this.selectedHearing = hearing;
    this.isModalOpen = true;
  }

  // Closes the modal and resets the selected hearing
  closeHearingModal(): void {
    this.isModalOpen = false;
    this.selectedHearing = null;
  }

  // --- CRUD OPERATIONS ---

  // Called when the modal emits a save event.
  // This is the "smart" part — the parent decides which API call to make.
  onHearingSave(formData: HearingFormData): void {
    if (!this.caseData) return;

    if (this.selectedHearing) {
      // EDIT MODE: Update existing hearing
      this.hearingService
        .updateHearing(this.caseData.id, this.selectedHearing.id, formData)
        .subscribe({
          next: () => {
            // Update the local data so the UI reflects the change immediately
            // without needing to re-fetch from the server.
            const index = this.caseData!.hearings.findIndex(
              (h) => h.id === this.selectedHearing!.id,
            );

            if (index !== -1) {
              this.caseData!.hearings[index] = {
                ...this.caseData!.hearings[index],
                description: formData.description,
                hearingDate: formData.hearingDate,
                location: formData.location,
              };
            }

            this.closeHearingModal();
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error updating hearing:', err);
            alert('Failed to update hearing. Please try again.');
          },
        });
    } else {
      // ADD MODE: Create new hearing
      this.hearingService.createHearing(this.caseData.id, formData).subscribe({
        next: (createdHearing) => {
          // The API returns the new hearing with its generated ID.
          // Push it onto the local array so it appears immediately.
          this.caseData!.hearings.push(createdHearing);
          this.closeHearingModal();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error creating hearing:', err);
          alert('Failed to create hearing. Please try again.');
        },
      });
    }
  }

  // Soft-deletes a hearing after user confirmation
  deleteHearing(hearing: Hearing): void {
    if (!this.caseData) return;

    // Always confirm destructive actions. This is a UX best practice
    // and especially important in legal software where accidental
    // deletion could have real consequences.
    const isConfirmed = confirm(
      `Are you sure you want to delete the hearing "${hearing.description}"?\n\nThis action cannot be undone.`,
    );

    if (!isConfirmed) return;

    this.hearingService.deleteHearing(this.caseData.id, hearing.id).subscribe({
      next: () => {
        // Remove from local array so it disappears from the UI immediately.
        // We filter by ID rather than using splice(index) because it's
        // safer — the array order could theoretically change.
        this.caseData!.hearings = this.caseData!.hearings.filter((h) => h.id !== hearing.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting hearing:', err);
        alert('Failed to delete hearing. Please try again.');
      },
    });
  }
}
