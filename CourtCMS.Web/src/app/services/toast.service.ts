import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  // A Subject is like an event bus. Any component can subscribe to it,
  // and any component/service can push messages into it.
  private toastSubject = new Subject<Toast>();

  // Expose as Observable so consumers can only READ, not write.
  toast$ = this.toastSubject.asObservable();

  success(message: string): void {
    this.toastSubject.next({ message, type: 'success' });
  }

  error(message: string): void {
    this.toastSubject.next({ message, type: 'error' });
  }
}
