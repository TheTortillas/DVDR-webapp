import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvidenceDialogComponent } from './evidence-dialog.component';

describe('EvidenceDialogComponent', () => {
  let component: EvidenceDialogComponent;
  let fixture: ComponentFixture<EvidenceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvidenceDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvidenceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
