import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Party, CaseParty } from '../../models/case.model';

export interface CasePartyFormData {
  partyId: number | null;
  role: string;
}

@Component({
  selector: 'app-case-party-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './case-party-modal.component.html',
  styleUrl: './case-party-modal.component.scss',
})
export class CasePartyModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isSaving = false;

  // All available parties to choose from (fetched by the parent)
  @Input() availableParties: Party[] = [];

  // Parties already on this case — used to filter the dropdown
  // so you can't add someone who's already assigned
  @Input() existingParties: CaseParty[] = [];

  @Output() closeModal = new EventEmitter<void>();
  @Output() save = new EventEmitter<CasePartyFormData>();

  formData: CasePartyFormData = {
    partyId: null,
    role: '',
  };

  // Predefined roles for a court system
  roles = ['Plaintiff', 'Defendant', 'Witness', 'Respondent', 'Petitioner'];

  // Computed: parties NOT already assigned to this case
  get filteredParties(): Party[] {
    const existingIds = this.existingParties.map((p) => p.partyId);
    return this.availableParties.filter((p) => !existingIds.includes(p.id));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.resetForm();
    }
  }

  onSubmit(): void {
    if (this.isSaving) return;

    if (!this.formData.partyId || !this.formData.role) {
      return;
    }

    this.save.emit({ ...this.formData });
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onModalClick(event: Event): void {
    event.stopPropagation();
  }

  private resetForm(): void {
    this.formData = {
      partyId: null,
      role: '',
    };
  }
}
