import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseFormModalComponent } from './case-form-modal.component';

describe('CaseFormModalComponent', () => {
  let component: CaseFormModalComponent;
  let fixture: ComponentFixture<CaseFormModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaseFormModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaseFormModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
