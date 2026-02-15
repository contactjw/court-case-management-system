import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './party-form-modal.component.html',
  styleUrl: './party-form-modal.component.scss',
})
export class PartyFormModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isSaving = false;
  @Input() party: Party | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() save = new EventEmitter<PartyFormData>();

  partyForm: FormGroup;

  submitted = false;

  // formData: PartyFormData = {
  //   firstName: '',
  //   lastName: '',
  //   email: '',
  //   phone: '',
  // };

  private originalData: PartyFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  };

  constructor(private fb: FormBuilder) {
    this.partyForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],

      lastName: ['', [Validators.required, Validators.minLength(2)]],

      email: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
        ],
      ],
      phone: [
        '',
        [
          Validators.required,
          Validators.minLength(7),
          Validators.maxLength(16),
          Validators.pattern(/^[\d\s\-\.\(\)\+]+$/),
        ],
      ],
    });
  }

  get isEditMode(): boolean {
    return this.party !== null;
  }

  get isDirty(): boolean {
    if (!this.isEditMode) return true;

    const current = this.partyForm.value;

    return (
      current.firstName !== this.originalData.firstName ||
      current.lastName !== this.originalData.lastName ||
      current.email !== this.originalData.email ||
      current.phone !== this.originalData.phone
    );
  }

  get isSubmitDisabled(): boolean {
    if (this.isSaving) return true;
    if (this.isEditMode && !this.isDirty) return true;
    return false;
  }

  showError(fieldName: string): boolean {
    const control = this.partyForm.get(fieldName);
    if (!control) return false;
    return control.invalid && (control.dirty || control.touched || this.submitted);
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
        this.partyForm.reset(data); // reset clears dirty/touched flags
        this.originalData = { ...data };
        this.submitted = false;
      } else if (this.isOpen && !this.party) {
        this.resetForm();
      }
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.isSubmitDisabled) return;

    if (this.partyForm.invalid) return;

    this.save.emit(this.partyForm.value as PartyFormData);
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onModalClick(event: Event): void {
    event.stopPropagation();
  }

  private resetForm(): void {
    this.partyForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    });
    this.originalData = { firstName: '', lastName: '', email: '', phone: '' };
    this.submitted = false;
  }
}
