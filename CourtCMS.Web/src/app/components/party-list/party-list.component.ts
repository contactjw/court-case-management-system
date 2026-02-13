import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize, forkJoin, timer } from 'rxjs';
import { PartyService } from '../../services/party.service';
import { ToastService } from '../../services/toast.service';
import { Party } from '../../models/case.model';
import {
  PartyFormModalComponent,
  PartyFormData,
} from '../party-form-modal/party-form-modal.component';

@Component({
  selector: 'app-party-list',
  standalone: true,
  imports: [CommonModule, RouterModule, PartyFormModalComponent],
  templateUrl: './party-list.component.html',
  styleUrl: './party-list.component.scss',
})
export class PartyListComponent implements OnInit {
  parties: Party[] = [];

  // --- MODAL STATE ---
  isModalOpen = false;
  selectedParty: Party | null = null;
  isSaving = false;

  constructor(
    private partyService: PartyService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadParties();
  }

  loadParties(): void {
    this.partyService.getParties().subscribe({
      next: (data) => {
        this.parties = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching parties:', err);
      },
    });
  }

  // --- MODAL CONTROLS ---

  openCreateModal(): void {
    this.selectedParty = null;
    this.isSaving = false;
    this.isModalOpen = true;
  }

  openEditModal(party: Party): void {
    this.selectedParty = party;
    this.isSaving = false;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedParty = null;
    this.isSaving = false;
  }

  // --- CRUD OPERATIONS ---

  onPartySave(formData: PartyFormData): void {
    if (this.isSaving) return;
    this.isSaving = true;
    this.cdr.detectChanges();

    if (this.selectedParty) {
      this.updateParty(this.selectedParty.id, formData);
    } else {
      this.createParty(formData);
    }
  }

  private createParty(formData: PartyFormData): void {
    forkJoin({
      api: this.partyService.createParty(formData),
      delay: timer(500), // Minimum 0.5 second (use 1000 for 1 second, 2000 for 2 seconds, etc.)
    })
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: ({ api: createdParty }) => {
          this.isSaving = false;
          this.parties.push(createdParty);
          this.sortParties();
          this.closeModal();
          this.toastService.success(`${createdParty.firstName} ${createdParty.lastName} added.`);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSaving = false;
          console.error('Error creating party:', err);
          this.toastService.error('Failed to create party. Please try again.');
          this.cdr.detectChanges();
        },
      });
  }

  private updateParty(id: number, formData: PartyFormData): void {
    forkJoin({
      api: this.partyService.updateParty(id, formData),
      delay: timer(500), // Minimum 0.5 second (use 1000 for 1 second, 2000 for 2 seconds, etc.)
    })
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.isSaving = false;

          const partyToUpdate = this.parties.find((p) => p.id === id);
          if (partyToUpdate) {
            partyToUpdate.firstName = formData.firstName;
            partyToUpdate.lastName = formData.lastName;
            partyToUpdate.email = formData.email;
            partyToUpdate.phone = formData.phone;
          }

          this.sortParties();
          this.closeModal();
          this.toastService.success(
            `${formData.firstName} ${formData.lastName} updated successfully.`,
          );
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSaving = false;
          console.error('Error updating party:', err);
          this.toastService.error('Failed to update party. Please try again.');
          this.cdr.detectChanges();
        },
      });
  }

  deleteParty(party: Party): void {
    const isConfirmed = confirm(
      `Are you sure you want to delete ${party.firstName} ${party.lastName}?\n\nThis action cannot be undone.`,
    );

    if (!isConfirmed) return;

    this.partyService.deleteParty(party.id).subscribe({
      next: () => {
        this.parties = this.parties.filter((p) => p.id !== party.id);
        this.toastService.success(`${party.firstName} ${party.lastName} deleted.`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting party:', err);
        this.toastService.error('Failed to delete party. Please try again.');
      },
    });
  }

  private sortParties(): void {
    this.parties.sort((a, b) => a.lastName.localeCompare(b.lastName));
  }
}
