import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicBackgroundComponent } from './academic-background.component';

describe('AcademicBackgroundComponent', () => {
  let component: AcademicBackgroundComponent;
  let fixture: ComponentFixture<AcademicBackgroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcademicBackgroundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcademicBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
