import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaseService } from './services/case.service';
import { Case } from './models/case.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html', // Links to your new HTML file
  styleUrl: './app.component.scss', // Links to your new SCSS file
})
export class AppComponent implements OnInit {
  title = 'Court Case Management System';
  cases: Case[] = [];

  constructor(private caseService: CaseService) {}

  ngOnInit(): void {
    this.caseService.getCases().subscribe({
      next: (data) => {
        this.cases = data;
        console.log('Cases loaded:', data);
      },
      error: (err) => {
        console.error('Error fetching cases:', err);
      },
    });
  }
}
