import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltreRechercheVolsComponent } from './filtre-recherche-vols.component';

describe('FiltreRechercheVolsComponent', () => {
  let component: FiltreRechercheVolsComponent;
  let fixture: ComponentFixture<FiltreRechercheVolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltreRechercheVolsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltreRechercheVolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
