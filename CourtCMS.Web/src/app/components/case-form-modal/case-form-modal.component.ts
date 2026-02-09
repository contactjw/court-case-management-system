import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Case } from '../../models/case.model';

export interface CaseFormData {
  caseNumber: string;
  title: string;
  assignedJudgeId: number | null;
  status?: string;
}

@Component({
  selector: 'app-case-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './case-form-modal.component.html',
  styleUrl: './case-form-modal.component.scss',
})
export class CaseFormModalComponent implements OnChanges {
  // --- INPUTS ---
  // Controls whether the modal is visible
  @Input() isOpen = false;

  @Input() courtCase: Case | null = null;

  @Input() judges: { id: number; fullName: string }[] = [];

  // --- OUTPUTS ---
  @Output() closeModal = new EventEmitter<void>();
  @Output() save = new EventEmitter<CaseFormData>();

  // --- LOCAL STATE ---
  formData: CaseFormData = {
    caseNumber: '',
    title: '',
    assignedJudgeId: null,
    status: '',
  };

  // Available statuses for the Edit mode dropdown
  statuses = ['Open', 'Closed', 'Suspended'];

  get isEditMode(): boolean {
    return this.courtCase !== null;
  }

  // -- LIFECYCLE HOOKS ---
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['courtCase'] || changes['isOpen']) {
      if (this.isOpen && this.courtCase) {
        // EDIT Mode: pre-fill form with existing case data
        this.formData = {
          caseNumber: this.courtCase.caseNumber,
          title: this.courtCase.title,
          assignedJudgeId: this.courtCase.assignedJudgeId ?? null,
          status: this.courtCase.status,
        };
      } else if (this.isOpen && !this.courtCase) {
        // ADD Mode: blank form
        this.resetForm();
      }
    }
  }

  // -- METHODS --
  onSubmit(): void {
    // Validate required fields
    if (
      !this.formData.caseNumber.trim() ||
      !this.formData.title.trim() ||
      !this.formData.assignedJudgeId
    ) {
      return;
    }

    // Build the emitted data
    // Create mode excludes status (backend defaults to "Open")
    // For EDIT Mode, we include status so the parent can decide whether to update it or not.
    const emitData: CaseFormData = { ...this.formData };

    if (!this.isEditMode) {
      delete emitData.status;
    }

    this.save.emit(emitData);
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onModalClick(event: Event): void {
    event.stopPropagation();
  }

  // --- PRIVATE METHODS ---
  private resetForm(): void {
    this.formData = {
      caseNumber: '',
      title: '',
      assignedJudgeId: null,
      status: '',
    };
  }
}
