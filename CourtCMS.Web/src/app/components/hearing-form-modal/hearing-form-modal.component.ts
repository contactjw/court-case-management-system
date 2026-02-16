import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Hearing } from '../../models/case.model';

export interface HearingFormData {
  description: string;
  hearingDate: string;
  location: string;
}

@Component({
  selector: 'app-hearing-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './hearing-form-modal.component.html',
  styleUrl: './hearing-form-modal.component.scss',
})
export class HearingFormModalComponent implements OnChanges {
  // --- INPUTS ---
  @Input() isOpen = false;
  @Input() isSaving = false;
  @Input() hearing: Hearing | null = null;

  // --- OUTPUTS ---
  @Output() closeModal = new EventEmitter<void>();
  @Output() save = new EventEmitter<HearingFormData>();

  hearingForm: FormGroup;
  submitted = false;

  // Snapshot of original values — used for dirty tracking
  private originalData: HearingFormData = {
    description: '',
    hearingDate: '',
    location: '',
  };

  constructor(private fb: FormBuilder) {
    this.hearingForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3)]],

      hearingDate: ['', [Validators.required]],

      location: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  get isEditMode(): boolean {
    return this.hearing !== null;
  }

  // Returns true if the user has changed at least one field
  get isDirty(): boolean {
    if (!this.isEditMode) return true;

    const current = this.hearingForm.value;
    return (
      current.description !== this.originalData.description ||
      current.hearingDate !== this.originalData.hearingDate ||
      current.location !== this.originalData.location
    );
  }

  // Button disabled if saving, or in edit mode with no changes
  get isSubmitDisabled(): boolean {
    if (this.isSaving) return true;
    if (this.isEditMode && !this.isDirty) return true;
    return false;
  }

  showError(fieldName: string): boolean {
    const control = this.hearingForm.get(fieldName);
    if (!control) return false;
    return control.invalid && (control.dirty || control.touched || this.submitted);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hearing'] || changes['isOpen']) {
      if (this.isOpen && this.hearing) {
        const data: HearingFormData = {
          description: this.hearing.description,
          hearingDate: this.formatDateForInput(this.hearing.hearingDate),
          location: this.hearing.location,
        };
        this.hearingForm.reset(data);
        this.originalData = { ...data };
        this.submitted = false;
      } else if (this.isOpen && !this.hearing) {
        this.resetForm();
      }
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.isSubmitDisabled) return;
    if (this.hearingForm.invalid) return;

    this.save.emit(this.hearingForm.value as HearingFormData);
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onModalClick(event: Event): void {
    event.stopPropagation();
  }

  // ============================================================
  // HELPERS
  // ============================================================

  private resetForm(): void {
    this.hearingForm.reset({
      description: '',
      hearingDate: '',
      location: '',
    });
    this.originalData = { description: '', hearingDate: '', location: '' };
    this.submitted = false;
  }

  // Converts an ISO date string from the API (e.g. "2024-03-15T14:30:00Z")
  // into the format that <input type="datetime-local"> expects: "2024-03-15T14:30"
  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
