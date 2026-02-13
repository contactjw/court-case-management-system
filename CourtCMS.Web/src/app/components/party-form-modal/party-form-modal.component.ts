import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Party } from '../../models/case.model';

export interface PartyFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-party-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './party-form-modal.component.html',
  styleUrl: './party-form-modal.component.scss',
})
export class PartyFormModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isSaving = false;
  @Input() party: Party | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() save = new EventEmitter<PartyFormData>();

  formData: PartyFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  };

  private originalData: PartyFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  };

  get isEditMode(): boolean {
    return this.party !== null;
  }

  get isDirty(): boolean {
    return (
      this.formData.firstName !== this.originalData.firstName ||
      this.formData.lastName !== this.originalData.lastName ||
      this.formData.email !== this.originalData.email ||
      this.formData.phone !== this.originalData.phone
    );
  }

  get isSubmitDisabled(): boolean {
    if (this.isSaving) return true;
    if (this.isEditMode && !this.isDirty) return true;
    return false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['party'] || changes['isOpen']) {
      if (this.isOpen && this.party) {
        const data: PartyFormData = {
          firstName: this.party.firstName,
          lastName: this.party.lastName,
          email: this.party.email,
          phone: this.party.phone,
        };
        this.formData = { ...data };
        this.originalData = { ...data };
      } else if (this.isOpen && !this.party) {
        this.resetForm();
      }
    }
  }

  onSubmit(): void {
    if (this.isSubmitDisabled) return;

    if (
      !this.formData.firstName.trim() ||
      !this.formData.lastName.trim() ||
      !this.formData.email.trim() ||
      !this.formData.phone.trim()
    ) {
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
    const blank: PartyFormData = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    };
    this.formData = { ...blank };
    this.originalData = { ...blank };
  }
}
