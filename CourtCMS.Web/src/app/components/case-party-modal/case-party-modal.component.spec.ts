import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasePartyModalComponent } from './case-party-modal.component';

describe('CasePartyModalComponent', () => {
  let component: CasePartyModalComponent;
  let fixture: ComponentFixture<CasePartyModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CasePartyModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CasePartyModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
