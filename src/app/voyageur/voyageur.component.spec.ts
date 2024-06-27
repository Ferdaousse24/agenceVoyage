import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoyageurComponent } from './voyageur.component';

describe('VoyageurComponent', () => {
  let component: VoyageurComponent;
  let fixture: ComponentFixture<VoyageurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoyageurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoyageurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
