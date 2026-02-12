import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CaseService } from '../../services/case.service';
import { HearingService } from '../../services/hearing.service';
import { PartyService } from '../../services/party.service';
import { CasePartyService } from '../../services/case-party.service';
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

  // --- CASE PARTY MODAL STATE ---
  isPartyModalOpen = false;
  allParties: Party[] = []; // Full party directory for the dropdown

  constructor(
    private route: ActivatedRoute,
    private caseService: CaseService,
    private hearingService: HearingService,
    private partyService: PartyService,
    private casePartyService: CasePartyService,
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

  // Load ALL parties so the modal dropdown has options
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

  // --- HEARING MODAL CONTROLS ---

  openAddHearingModal(): void {
    this.selectedHearing = null;
    this.isHearingModalOpen = true;
  }

  openEditHearingModal(hearing: Hearing): void {
    this.selectedHearing = hearing;
    this.isHearingModalOpen = true;
  }

  closeHearingModal(): void {
    this.isHearingModalOpen = false;
    this.selectedHearing = null;
  }

  // --- HEARING CRUD ---

  onHearingSave(formData: HearingFormData): void {
    if (!this.caseData) return;

    if (this.selectedHearing) {
      this.hearingService
        .updateHearing(this.caseData.id, this.selectedHearing.id, formData)
        .subscribe({
          next: () => {
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
      this.hearingService.createHearing(this.caseData.id, formData).subscribe({
        next: (createdHearing) => {
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

  deleteHearing(hearing: Hearing): void {
    if (!this.caseData) return;

    const isConfirmed = confirm(
      `Are you sure you want to delete the hearing "${hearing.description}"?\n\nThis action cannot be undone.`,
    );

    if (!isConfirmed) return;

    this.hearingService.deleteHearing(this.caseData.id, hearing.id).subscribe({
      next: () => {
        this.caseData!.hearings = this.caseData!.hearings.filter((h) => h.id !== hearing.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting hearing:', err);
        alert('Failed to delete hearing. Please try again.');
      },
    });
  }

  // --- CASE PARTY MODAL CONTROLS ---

  openAddPartyModal(): void {
    this.isPartyModalOpen = true;
  }

  closePartyModal(): void {
    this.isPartyModalOpen = false;
  }

  // --- CASE PARTY CRUD ---

  onCasePartySave(formData: CasePartyFormData): void {
    if (!this.caseData || !formData.partyId) return;

    this.casePartyService
      .addPartyToCase(this.caseData.id, {
        partyId: formData.partyId,
        role: formData.role,
      })
      .subscribe({
        next: (newCaseParty) => {
          this.caseData!.parties.push(newCaseParty);
          this.closePartyModal();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error adding party to case:', err);
          alert('Failed to add party to case. Please try again.');
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
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error removing party from case:', err);
        alert('Failed to remove party. Please try again.');
      },
    });
  }
}
