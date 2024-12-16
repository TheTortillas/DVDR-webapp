import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApertureInfoComponent } from './aperture-info.component';

describe('ApertureInfoComponent', () => {
  let component: ApertureInfoComponent;
  let fixture: ComponentFixture<ApertureInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApertureInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApertureInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
