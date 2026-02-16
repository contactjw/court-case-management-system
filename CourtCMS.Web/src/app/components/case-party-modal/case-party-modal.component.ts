import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Party, CaseParty } from '../../models/case.model';

export interface CasePartyFormData {
  partyId: number | null;
  role: string;
}

@Component({
  selector: 'app-case-party-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  casePartyForm: FormGroup;
  submitted = false;

  // Predefined roles for a court system
  roles = ['Plaintiff', 'Defendant', 'Witness', 'Respondent', 'Petitioner'];

  constructor(private fb: FormBuilder) {
    this.casePartyForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // partyId: null default means nothing selected.
      // Validators.required fails on null, so this catches "no selection" properly.
      partyId: [null, [Validators.required]],

      // role: empty string default means nothing selected.
      // Validators.required fails on empty strings.
      role: ['', [Validators.required]],
    });
  }

  // Computed: parties NOT already assigned to this case
  get filteredParties(): Party[] {
    const existingIds = this.existingParties.map((p) => p.partyId);
    return this.availableParties.filter((p) => !existingIds.includes(p.id));
  }

  showError(fieldName: string): boolean {
    const control = this.casePartyForm.get(fieldName);
    if (!control) return false;
    return control.invalid && (control.dirty || control.touched || this.submitted);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.resetForm();
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.isSaving) return;
    if (this.casePartyForm.invalid) return;

    this.save.emit(this.casePartyForm.value as CasePartyFormData);
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onModalClick(event: Event): void {
    event.stopPropagation();
  }

  private resetForm(): void {
    this.casePartyForm.reset({
      partyId: null,
      role: '',
    });
    this.submitted = false;
  }
}
