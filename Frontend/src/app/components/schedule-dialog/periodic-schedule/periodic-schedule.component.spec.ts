import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodicScheduleComponent } from './periodic-schedule.component';

describe('PeriodicScheduleComponent', () => {
  let component: PeriodicScheduleComponent;
  let fixture: ComponentFixture<PeriodicScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodicScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeriodicScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
