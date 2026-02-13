import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin, timer } from 'rxjs';
import { CaseService } from '../../services/case.service';
import { HearingService } from '../../services/hearing.service';
import { PartyService } from '../../services/party.service';
import { CasePartyService } from '../../services/case-party.service';
import { ToastService } from '../../services/toast.service';
import { CaseDetail, Hearing, Party } from '../../models/case.model';
import {
  HearingFormModalComponent,
  HearingFormData,
} from '../hearing-form-modal/hearing-form-modal.component';
import {
  CasePartyModalComponent,
  CasePartyFormData,
} from '../case-party-modal/case-party-modal.component';

@Component({
  selector: 'app-case-details',
  standalone: true,
  imports: [CommonModule, RouterLink, HearingFormModalComponent, CasePartyModalComponent],
  templateUrl: './case-details.component.html',
  styleUrl: './case-details.component.scss',
})
export class CaseDetailsComponent implements OnInit {
  caseData?: CaseDetail;
  isLoading = true;
  errorMessage = '';

  // --- HEARING MODAL STATE ---
  isHearingModalOpen = false;
  selectedHearing: Hearing | null = null;
  isHearingSaving = false;

  // --- CASE PARTY MODAL STATE ---
  isPartyModalOpen = false;
  allParties: Party[] = [];
  isPartySaving = false;

  constructor(
    private route: ActivatedRoute,
    private caseService: CaseService,
    private hearingService: HearingService,
    private partyService: PartyService,
    private casePartyService: CasePartyService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id && !isNaN(id)) {
      this.loadCaseDetails(id);
      this.loadAllParties();
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

  loadAllParties(): void {
    this.partyService.getParties().subscribe({
      next: (data) => {
        this.allParties = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching parties:', err);
      },
    });
  }

  // ========================================
  // HEARING MODAL CONTROLS
  // ========================================

  openAddHearingModal(): void {
    this.selectedHearing = null;
    this.isHearingSaving = false;
    this.isHearingModalOpen = true;
  }

  openEditHearingModal(hearing: Hearing): void {
    this.selectedHearing = hearing;
    this.isHearingSaving = false;
    this.isHearingModalOpen = true;
  }

  closeHearingModal(): void {
    this.isHearingModalOpen = false;
    this.selectedHearing = null;
    this.isHearingSaving = false;
  }

  // ========================================
  // HEARING CRUD
  // ========================================

  onHearingSave(formData: HearingFormData): void {
    if (!this.caseData || this.isHearingSaving) return;
    this.isHearingSaving = true;

    if (this.selectedHearing) {
      this.updateHearing(this.selectedHearing.id, formData);
    } else {
      this.createHearing(formData);
    }
  }

  private createHearing(formData: HearingFormData): void {
    forkJoin({
      api: this.hearingService.createHearing(this.caseData!.id, formData),
      delay: timer(500), // Minimum 0.5 second (use 1000 for 1 second, 2000 for 2 seconds, etc.)
    })
      .pipe(finalize(() => (this.isHearingSaving = false)))
      .subscribe({
        next: ({ api: createdHearing }) => {
          this.isHearingSaving = false;
          this.caseData!.hearings.push(createdHearing);
          this.closeHearingModal();
          this.toastService.success('Hearing added successfully.');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isHearingSaving = false;
          console.error('Error creating hearing:', err);
          this.toastService.error('Failed to create hearing. Please try again.');
          this.cdr.detectChanges();
        },
      });
  }

  private updateHearing(hearingId: number, formData: HearingFormData): void {
    forkJoin({
      api: this.hearingService.updateHearing(this.caseData!.id, hearingId, formData),
      delay: timer(500), // Minimum 0.5 second (use 1000 for 1 second, 2000 for 2 seconds, etc.)
    })
      .pipe(finalize(() => (this.isHearingSaving = false)))
      .subscribe({
        next: () => {
          this.isHearingSaving = false;

          // Update the hearing in the local array
          const index = this.caseData!.hearings.findIndex((h) => h.id === hearingId);
          if (index !== -1) {
            this.caseData!.hearings[index] = {
              ...this.caseData!.hearings[index],
              description: formData.description,
              hearingDate: formData.hearingDate,
              location: formData.location,
            };
          }

          this.closeHearingModal();
          this.toastService.success('Hearing updated successfully.');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isHearingSaving = false;
          console.error('Error updating hearing:', err);
          this.toastService.error('Failed to update hearing. Please try again.');
          this.cdr.detectChanges();
        },
      });
  }

  deleteHearing(hearing: Hearing): void {
    if (!this.caseData) return;

    const isConfirmed = confirm(
      `Are you sure you want to delete the hearing "${hearing.description}"?\n\nThis action cannot be undone.`,
    );

    if (!isConfirmed) return;

    this.hearingService.deleteHearing(this.caseData.id, hearing.id).subscribe({
      next: () => {
        this.caseData!.hearings = this.caseData!.hearings.filter((h) => h.id !== hearing.id);
        this.toastService.success(`Hearing "${hearing.description}" deleted.`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting hearing:', err);
        this.toastService.error('Failed to delete hearing. Please try again.');
      },
    });
  }

  // ========================================
  // CASE PARTY MODAL CONTROLS
  // ========================================

  openAddPartyModal(): void {
    this.isPartySaving = false;
    this.isPartyModalOpen = true;
  }

  closePartyModal(): void {
    this.isPartyModalOpen = false;
    this.isPartySaving = false;
  }

  // ========================================
  // CASE PARTY CRUD
  // ========================================

  onCasePartySave(formData: CasePartyFormData): void {
    if (!this.caseData || !formData.partyId || this.isPartySaving) return;
    this.isPartySaving = true;

    forkJoin({
      api: this.casePartyService.addPartyToCase(this.caseData.id, {
        partyId: formData.partyId,
        role: formData.role,
      }),
      delay: timer(1000),
    })
      .pipe(finalize(() => (this.isPartySaving = false)))
      .subscribe({
        next: ({ api: newCaseParty }) => {
          this.isPartySaving = false;
          this.caseData!.parties.push(newCaseParty);
          this.closePartyModal();
          this.toastService.success('Party added to case.');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isPartySaving = false;
          console.error('Error adding party to case:', err);
          this.toastService.error('Failed to add party to case. Please try again.');
          this.cdr.detectChanges();
        },
      });
  }

  removePartyFromCase(partyId: number, fullName: string): void {
    if (!this.caseData) return;

    const isConfirmed = confirm(
      `Remove ${fullName} from this case?\n\nThis does not delete the party, it only removes their association with this case.`,
    );

    if (!isConfirmed) return;

    this.casePartyService.removePartyFromCase(this.caseData.id, partyId).subscribe({
      next: () => {
        this.caseData!.parties = this.caseData!.parties.filter((p) => p.partyId !== partyId);
        this.toastService.success(`${fullName} removed from case.`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error removing party from case:', err);
        this.toastService.error('Failed to remove party. Please try again.');
      },
    });
  }
}
