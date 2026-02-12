import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from '../../services/toast.service';

interface ActiveToast extends Toast {
  id: number;
  exiting: boolean;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ActiveToast[] = [];
  private subscription!: Subscription;
  private nextId = 0;

  constructor(
    private toastService: ToastService,
    private cdr: ChangeDetectorRef, // ← ADD THIS
  ) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toast$.subscribe((toast) => {
      const activeToast: ActiveToast = {
        ...toast,
        id: this.nextId++,
        exiting: false,
      };

      this.toasts.push(activeToast);
      this.cdr.detectChanges(); // ← Force this component to render

      setTimeout(() => this.dismiss(activeToast.id), 4000);
    });
  }

  dismiss(id: number): void {
    const toast = this.toasts.find((t) => t.id === id);
    if (!toast || toast.exiting) return;

    toast.exiting = true;
    this.cdr.detectChanges(); // ← Force render for exit animation

    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== id);
      this.cdr.detectChanges(); // ← Force render for removal
    }, 300);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
