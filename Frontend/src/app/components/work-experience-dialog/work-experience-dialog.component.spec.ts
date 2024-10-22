import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkExperienceDialogComponent } from './work-experience-dialog.component';

describe('WorkExperienceDialogComponent', () => {
  let component: WorkExperienceDialogComponent;
  let fixture: ComponentFixture<WorkExperienceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkExperienceDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkExperienceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
