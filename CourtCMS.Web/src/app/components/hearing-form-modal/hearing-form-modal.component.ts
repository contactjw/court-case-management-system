import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Hearing } from '../../models/case.model';

export interface HearingFormData {
  description: string;
  hearingDate: string;
  location: string;
}

@Component({
  selector: 'app-hearing-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  formData: HearingFormData = {
    description: '',
    hearingDate: '',
    location: '',
  };

  // Snapshot of original values — used for dirty tracking
  private originalData: HearingFormData = {
    description: '',
    hearingDate: '',
    location: '',
  };

  get isEditMode(): boolean {
    return this.hearing !== null;
  }

  // Returns true if the user has changed at least one field
  get isDirty(): boolean {
    return (
      this.formData.description !== this.originalData.description ||
      this.formData.hearingDate !== this.originalData.hearingDate ||
      this.formData.location !== this.originalData.location
    );
  }

  // Button disabled if saving, or in edit mode with no changes
  get isSubmitDisabled(): boolean {
    if (this.isSaving) return true;
    if (this.isEditMode && !this.isDirty) return true;
    return false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hearing'] || changes['isOpen']) {
      if (this.isOpen && this.hearing) {
        const data: HearingFormData = {
          description: this.hearing.description,
          hearingDate: this.formatDateForInput(this.hearing.hearingDate),
          location: this.hearing.location,
        };
        this.formData = { ...data };
        this.originalData = { ...data };
      } else if (this.isOpen && !this.hearing) {
        this.resetForm();
      }
    }
  }

  onSubmit(): void {
    if (this.isSubmitDisabled) return;

    if (
      !this.formData.description.trim() ||
      !this.formData.hearingDate ||
      !this.formData.location.trim()
    ) {
      return;
    }
    this.save.emit(this.formData);
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onModalClick(event: Event): void {
    event.stopPropagation();
  }

  private resetForm(): void {
    const blank: HearingFormData = {
      description: '',
      hearingDate: '',
      location: '',
    };
    this.formData = { ...blank };
    this.originalData = { ...blank };
  }

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
