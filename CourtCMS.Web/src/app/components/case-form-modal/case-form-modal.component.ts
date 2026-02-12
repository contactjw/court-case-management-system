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
  @Input() isOpen = false;
  @Input() isSaving = false;
  @Input() courtCase: Case | null = null;
  @Input() judges: { id: number; fullName: string }[] = [];

  @Output() closeModal = new EventEmitter<void>();
  @Output() save = new EventEmitter<CaseFormData>();

  formData: CaseFormData = {
    caseNumber: '',
    title: '',
    assignedJudgeId: null,
    status: '',
  };

  // Snapshot of the original values when the modal opened.
  // We compare against this to know if the user changed anything.
  private originalData: CaseFormData = {
    caseNumber: '',
    title: '',
    assignedJudgeId: null,
    status: '',
  };

  statuses = ['Open', 'Closed', 'Suspended'];

  get isEditMode(): boolean {
    return this.courtCase !== null;
  }

  // Dirty tracking: compares current form values against the snapshot.
  // Returns true if the user has changed at least one field.
  get isDirty(): boolean {
    return (
      this.formData.caseNumber !== this.originalData.caseNumber ||
      this.formData.title !== this.originalData.title ||
      this.formData.assignedJudgeId !== this.originalData.assignedJudgeId ||
      this.formData.status !== this.originalData.status
    );
  }

  // The submit button should be disabled if:
  // 1. We're in edit mode and nothing has changed (not dirty), OR
  // 2. A save is currently in progress
  get isSubmitDisabled(): boolean {
    if (this.isSaving) return true;
    if (this.isEditMode && !this.isDirty) return true;
    return false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['courtCase'] || changes['isOpen']) {
      if (this.isOpen && this.courtCase) {
        const data: CaseFormData = {
          caseNumber: this.courtCase.caseNumber,
          title: this.courtCase.title,
          assignedJudgeId: this.courtCase.assignedJudgeId ?? null,
          status: this.courtCase.status,
        };
        this.formData = { ...data };
        // Take a snapshot so we can compare later
        this.originalData = { ...data };
      } else if (this.isOpen && !this.courtCase) {
        this.resetForm();
      }
    }
  }

  onSubmit(): void {
    if (this.isSubmitDisabled) return;

    if (
      !this.formData.caseNumber.trim() ||
      !this.formData.title.trim() ||
      !this.formData.assignedJudgeId
    ) {
      return;
    }

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

  private resetForm(): void {
    const blank: CaseFormData = {
      caseNumber: '',
      title: '',
      assignedJudgeId: null,
      status: '',
    };
    this.formData = { ...blank };
    this.originalData = { ...blank };
  }
}
