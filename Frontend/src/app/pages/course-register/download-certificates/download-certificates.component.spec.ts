import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadCertificatesComponent } from './download-certificates.component';

describe('DownloadCertificatesComponent', () => {
  let component: DownloadCertificatesComponent;
  let fixture: ComponentFixture<DownloadCertificatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadCertificatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DownloadCertificatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
