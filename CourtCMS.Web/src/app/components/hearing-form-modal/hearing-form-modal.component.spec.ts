import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HearingFormModalComponent } from './hearing-form-modal.component';

describe('HearingFormModalComponent', () => {
  let component: HearingFormModalComponent;
  let fixture: ComponentFixture<HearingFormModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HearingFormModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HearingFormModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
