import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralInformationInstructorComponent } from './general-information-instructor.component';

describe('GeneralInformationInstructorComponent', () => {
  let component: GeneralInformationInstructorComponent;
  let fixture: ComponentFixture<GeneralInformationInstructorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralInformationInstructorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralInformationInstructorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
