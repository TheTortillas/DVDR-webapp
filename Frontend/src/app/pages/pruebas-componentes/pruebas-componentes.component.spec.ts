import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PruebasComponentesComponent } from './pruebas-componentes.component';

describe('PruebasComponentesComponent', () => {
  let component: PruebasComponentesComponent;
  let fixture: ComponentFixture<PruebasComponentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PruebasComponentesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PruebasComponentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
