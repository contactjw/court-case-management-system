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
  @Input() party: Party | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() save = new EventEmitter<PartyFormData>();

  formData: PartyFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  };

  get isEditMode(): boolean {
    return this.party !== null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['party'] || changes['isOpen']) {
      if (this.isOpen && this.party) {
        this.formData = {
          firstName: this.party.firstName,
          lastName: this.party.lastName,
          email: this.party.email,
          phone: this.party.phone,
        };
      } else if (this.isOpen && !this.party) {
        this.resetForm();
      }
    }
  }

  onSubmit(): void {
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
    this.formData = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    };
  }
}
