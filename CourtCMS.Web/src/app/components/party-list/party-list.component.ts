import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PartyService } from '../../services/party.service';
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

  constructor(
    private partyService: PartyService,
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
    this.isModalOpen = true;
  }

  openEditModal(party: Party): void {
    this.selectedParty = party;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedParty = null;
  }

  // --- CRUD OPERATIONS ---

  onPartySave(formData: PartyFormData): void {
    if (this.selectedParty) {
      this.updateParty(this.selectedParty.id, formData);
    } else {
      this.createParty(formData);
    }
  }

  private createParty(formData: PartyFormData): void {
    this.partyService.createParty(formData).subscribe({
      next: (createdParty) => {
        this.parties.push(createdParty);
        this.sortParties();
        this.closeModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creating party:', err);
        alert('Failed to create party. Please try again.');
      },
    });
  }

  private updateParty(id: number, formData: PartyFormData): void {
    this.partyService.updateParty(id, formData).subscribe({
      next: () => {
        const partyToUpdate = this.parties.find((p) => p.id === id);

        if (partyToUpdate) {
          partyToUpdate.firstName = formData.firstName;
          partyToUpdate.lastName = formData.lastName;
          partyToUpdate.email = formData.email;
          partyToUpdate.phone = formData.phone;
        }

        this.sortParties();
        this.closeModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating party:', err);
        alert('Failed to update party. Please try again.');
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
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting party:', err);
        alert('Could not delete party. Check console for details.');
      },
    });
  }

  private sortParties(): void {
    this.parties.sort((a, b) => {
      const lastNameCompare = a.lastName.localeCompare(b.lastName);
      return lastNameCompare !== 0 ? lastNameCompare : a.firstName.localeCompare(b.firstName);
    });
  }
}
