import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartyFormModalComponent } from './party-form-modal.component';

describe('PartyFormModalComponent', () => {
  let component: PartyFormModalComponent;
  let fixture: ComponentFixture<PartyFormModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartyFormModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartyFormModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
