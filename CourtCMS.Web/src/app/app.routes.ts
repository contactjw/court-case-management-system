import { Routes } from '@angular/router';
import { CaseListComponent } from './components/case-list/case-list.component';
import { CaseDetailsComponent } from './components/case-details/case-details.component';
import { PartyListComponent } from './components/party-list/party-list.component';

export const routes: Routes = [
  { path: '', component: CaseListComponent },
  { path: 'cases/:id', component: CaseDetailsComponent },
  { path: 'parties', component: PartyListComponent },
];
