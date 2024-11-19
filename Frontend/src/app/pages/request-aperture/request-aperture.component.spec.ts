import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestApertureComponent } from './request-aperture.component';

describe('RequestApertureComponent', () => {
  let component: RequestApertureComponent;
  let fixture: ComponentFixture<RequestApertureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestApertureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestApertureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
