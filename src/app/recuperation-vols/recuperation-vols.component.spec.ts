import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecuperationVolsComponent } from './recuperation-vols.component';

describe('RecuperationVolsComponent', () => {
  let component: RecuperationVolsComponent;
  let fixture: ComponentFixture<RecuperationVolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecuperationVolsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecuperationVolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
