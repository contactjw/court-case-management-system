import { Routes } from '@angular/router';
import { CaseListComponent } from './components/case-list/case-list.component';
import { CaseDetailsComponent } from './components/case-details/case-details.component';

export const routes: Routes = [
  { path: '', component: CaseListComponent }, // Home page = case list
  { path: 'cases/:id', component: CaseDetailsComponent }, // Details page
];
