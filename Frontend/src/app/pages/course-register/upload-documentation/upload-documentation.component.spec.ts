import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadDocumentationComponent } from './upload-documentation.component';

describe('UploadDocumentationComponent', () => {
  let component: UploadDocumentationComponent;
  let fixture: ComponentFixture<UploadDocumentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadDocumentationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
