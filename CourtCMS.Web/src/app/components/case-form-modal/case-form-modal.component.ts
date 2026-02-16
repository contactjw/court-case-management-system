import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  imports: [CommonModule, ReactiveFormsModule],
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

  caseForm: FormGroup;
  submitted = false;
  statuses = ['Open', 'Closed', 'Suspended'];

  // Snapshot of the original values when the modal opened.
  // We compare against this to know if the user changed anything.
  private originalData: CaseFormData = {
    caseNumber: '',
    title: '',
    assignedJudgeId: null,
    status: '',
  };

  constructor(private fb: FormBuilder) {
    this.caseForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // Case number: required, must follow court format like "2024-CIV-001"
      // Pattern breakdown: 4 digits, dash, 2-4 uppercase letters, dash, 1-4 digits
      caseNumber: ['', [Validators.required, Validators.pattern(/^\d{4}-[A-Z]{2,4}-\d{1,4}$/)]],

      title: ['', [Validators.required, Validators.minLength(5)]],

      // Judge dropdown: required, Validators.required works on selects too.
      // When nothing is selected, the value is null, which fails required.
      assignedJudgeId: [null, [Validators.required]],

      // Status is NOT included here by default.
      // It gets dynamically added in ngOnChanges when we're in edit mode.
      // This is cleaner than always having it and ignoring it in create mode.
    });
  }

  get isEditMode(): boolean {
    return this.courtCase !== null;
  }

  // Dirty tracking: compares current form values against the snapshot.
  // Returns true if the user has changed at least one field.
  get isDirty(): boolean {
    if (!this.isEditMode) return true;

    const current = this.caseForm.value;

    return (
      current.caseNumber !== this.originalData.caseNumber ||
      current.title !== this.originalData.title ||
      current.assignedJudgeId !== this.originalData.assignedJudgeId ||
      current.status !== this.originalData.status
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

  showError(fieldName: string): boolean {
    const control = this.caseForm.get(fieldName);
    if (!control) return false;
    return control.invalid && (control.dirty || control.touched || this.submitted);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['courtCase'] || changes['isOpen']) {
      if (this.isOpen && this.courtCase) {
        if (!this.caseForm.get('status')) {
          this.caseForm.addControl('status', this.fb.control('', [Validators.required]));
        }

        const data: CaseFormData = {
          caseNumber: this.courtCase.caseNumber,
          title: this.courtCase.title,
          assignedJudgeId: this.courtCase.assignedJudgeId ?? null,
          status: this.courtCase.status,
        };
        this.caseForm.reset(data);
        // Take a snapshot so we can compare later
        this.originalData = { ...data };
        this.submitted = false;
      } else if (this.isOpen && !this.courtCase) {
        if (this.caseForm.get('status')) {
          this.caseForm.removeControl('status');
        }

        this.resetForm();
      }
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.isSubmitDisabled) return;
    if (this.caseForm.invalid) return;

    this.save.emit(this.caseForm.value as CaseFormData);
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
    };
    this.originalData = { caseNumber: '', title: '', assignedJudgeId: null, status: '' };
    this.submitted = false;
  }
}
