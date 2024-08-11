import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { PassagerComponent } from './passager.component';
import { By } from '@angular/platform-browser';

describe('PassagerComponent', () => {
  let component: PassagerComponent;
  let fixture: ComponentFixture<PassagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PassagerComponent],
      imports: [ReactiveFormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PassagerComponent);
    component = fixture.componentInstance;
    component.adultsCount = 2;
    component.childrenCount = 1;
    component.infantsCount = 1;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize voyageurs form groups correctly', () => {
    component.ngOnInit();
    expect(component.voyageursFormGroups.length).toBe(4);
    expect(component.voyageursFormGroups[0].get('type')?.value).toBe('Adulte');
    expect(component.voyageursFormGroups[2].get('type')?.value).toBe('Enfant');
    expect(component.voyageursFormGroups[3].get('type')?.value).toBe('Bébé');
  });

  it('should select a voyageur correctly', () => {
    component.selectVoyageur(1);
    expect(component.selectedVoyageurIndex).toBe(1);
  });

  it('should advance to the next voyageur on valid form', () => {
    component.ngOnInit();
    const spySelectVoyageur = spyOn(component, 'selectVoyageur').and.callThrough();

    // Mark the first form as valid
    component.voyageursFormGroups[0].get('titre')?.setValue('Mr');
    component.voyageursFormGroups[0].get('prenom')?.setValue('John');
    component.voyageursFormGroups[0].get('nom')?.setValue('Doe');
    component.voyageursFormGroups[0].get('nationalite')?.setValue('FR');
    component.voyageursFormGroups[0].get('dateNaissance')?.setValue('1990-01-01');
    component.voyageursFormGroups[0].get('numeroPasseport')?.setValue('123456789');
    component.voyageursFormGroups[0].get('telephone')?.setValue('0123456789');
    component.voyageursFormGroups[0].get('email')?.setValue('john.doe@example.com');

    component.onNext();

    expect(spySelectVoyageur).toHaveBeenCalledWith(1);
    expect(component.selectedVoyageurIndex).toBe(1);
  });

  it('should submit all voyageurs on last form submission', () => {
    component.ngOnInit();
    const spyVoyageursSubmit = spyOn(component.voyageursSubmit, 'emit').and.callThrough();

    // Mark all forms as valid
    component.voyageursFormGroups.forEach((form) => {
      form.get('titre')?.setValue('Mr');
      form.get('prenom')?.setValue('John');
      form.get('nom')?.setValue('Doe');
      form.get('nationalite')?.setValue('FR');
      form.get('dateNaissance')?.setValue('1990-01-01');
      form.get('numeroPasseport')?.setValue('123456789');
      form.get('telephone')?.setValue('0123456789');
      form.get('email')?.setValue('john.doe@example.com');
    });

    // Navigate through all forms
    component.onNext(); // 1st form
    component.onNext(); // 2nd form
    component.onNext(); // 3rd form
    component.onNext(); // 4th form (should submit)

    expect(spyVoyageursSubmit).toHaveBeenCalledWith(component.voyageursFormGroups.map(form => form.value));
  });
});
