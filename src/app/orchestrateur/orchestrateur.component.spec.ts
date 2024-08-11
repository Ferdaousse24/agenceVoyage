import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { OrchestrateurComponent } from './orchestrateur.component';
import { AmadeusService } from '../services/amadeus.service';
import { AirtableService } from '../services/airtable.service';
import { PaymentService } from '../services/payment.service';
import { EmailService } from '../services/email.service';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { FormRechercheVolsComponent } from '../form-recherche-vols/form-recherche-vols.component';
import { ListeVolsComponent } from '../liste-vols/liste-vols.component';
import { SelectedVolsComponent } from '../selected-vols/selected-vols.component';
import { PassagerComponent } from '../passager/passager.component';
import { PaymentComponent } from '../payment/payment.component';

describe('OrchestrateurComponent', () => {
  let component: OrchestrateurComponent;
  let fixture: ComponentFixture<OrchestrateurComponent>;
  let amadeusService: jasmine.SpyObj<AmadeusService>;
  let airtableService: jasmine.SpyObj<AirtableService>;
  let paymentService: jasmine.SpyObj<PaymentService>;
  let emailService: jasmine.SpyObj<EmailService>;

  beforeEach(async () => {
    const amadeusServiceSpy = jasmine.createSpyObj('AmadeusService', ['rechercherVolsAvecCritere']);
    const airtableServiceSpy = jasmine.createSpyObj('AirtableService', ['getCities', 'createRecord', 'findRecordByEmail']);
    const paymentServiceSpy = jasmine.createSpyObj('PaymentService', ['']);
    const emailServiceSpy = jasmine.createSpyObj('EmailService', ['sendConfirmationEmail']); // Ajout de sendConfirmationEmail
  
    await TestBed.configureTestingModule({
      declarations: [OrchestrateurComponent],
      imports: [
        CommonModule,
        MatTabsModule,
        FormRechercheVolsComponent,
        ListeVolsComponent,
        SelectedVolsComponent,
        PassagerComponent,
        PaymentComponent
      ],
      providers: [
        { provide: AmadeusService, useValue: amadeusServiceSpy },
        { provide: AirtableService, useValue: airtableServiceSpy },
        { provide: PaymentService, useValue: paymentServiceSpy },
        { provide: EmailService, useValue: emailServiceSpy },
      ]
    }).compileComponents();
  
    amadeusService = TestBed.inject(AmadeusService) as jasmine.SpyObj<AmadeusService>;
    airtableService = TestBed.inject(AirtableService) as jasmine.SpyObj<AirtableService>;
    paymentService = TestBed.inject(PaymentService) as jasmine.SpyObj<PaymentService>;
    emailService = TestBed.inject(EmailService) as jasmine.SpyObj<EmailService>;
  });
  

  beforeEach(() => {
    fixture = TestBed.createComponent(OrchestrateurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load cities on init', () => {
    const mockCities = [{ code: 'CDG', name: 'Paris Charles de Gaulle' }];
    airtableService.getCities.and.returnValue(of(mockCities));

    component.ngOnInit();

    expect(airtableService.getCities).toHaveBeenCalled();
    expect(component.cities).toEqual(mockCities);
  });

  it('should handle error when loading cities fails', () => {
    const consoleSpy = spyOn(console, 'error');
    airtableService.getCities.and.returnValue(throwError('error'));

    component.ngOnInit();

    expect(airtableService.getCities).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Error loading cities:', 'error');
  });

  it('should set the search criteria and retrieve flights', fakeAsync(() => {
    const mockVols = { volsAlle: [], volsRetour: [] };
    amadeusService.rechercherVolsAvecCritere.and.returnValue(Promise.resolve(mockVols));

    const critere = { departureCity: { code: 'CDG' }, destinationCity: { code: 'JFK' }, adults: 2, children: 1, infants: 0 };
    component.onCritereSubmit(critere);

    expect(component.isLoading).toBeTrue();
    tick();
    expect(component.parcours.critere).toEqual(critere);
    expect(component.parcours.vols).toEqual(mockVols);
    expect(component.stepCompleted[1]).toBeTrue();
    expect(component.isLoading).toBeFalse();
    expect(component.selectedIndex).toBe(1);
  }));

  it('should handle error during flight search', fakeAsync(() => {
    const consoleSpy = spyOn(console, 'error');
    amadeusService.rechercherVolsAvecCritere.and.returnValue(Promise.reject('error'));

    const critere = { departureCity: { code: 'CDG' }, destinationCity: { code: 'JFK' }, adults: 2, children: 1, infants: 0 };
    component.onCritereSubmit(critere);

    tick();
    expect(consoleSpy).toHaveBeenCalledWith('Erreur lors de la recherche des vols', 'error');
  }));

  it('should select the flight and move to the next step', () => {
    component.parcours.vols = { volsAlle: [{ price: { total: '100' } }], volsRetour: [{ price: { total: '100' } }] };
    const volIndices = [0, 0];
    component.onVolChoisi(volIndices);

    expect(component.selectedVols.length).toBe(1);
    expect(component.selectedVols[0].aller.price.total).toBe('100');
    expect(component.selectedVols[0].retour.price.total).toBe('100');
    expect(component.stepCompleted[2]).toBeTrue();
    expect(component.selectedIndex).toBe(2);
  });

  it('should calculate total price and move to the passengers step', () => {
    component.selectedVols = [{ aller: { price: { total: '100' } }, retour: { price: { total: '100' } } }];
    component.onConfirmDetails();

    expect(component.totalAmount).toBe(200);
    expect(component.stepCompleted[3]).toBeTrue();
    expect(component.selectedIndex).toBe(3);
  });

  it('should save client, reservation, and passengers, then move to payment step', fakeAsync(() => {
    const mockVoyageurs = [{ email: 'test@example.com', nom: 'Doe', prenom: 'John', telephone: '123456789' }];
    const mockClient = { fields: { client_id: 'client-id' } };
    const mockReservation = { id: 'reservation-id' };

    airtableService.findRecordByEmail.and.returnValue(Promise.resolve({}));
    airtableService.createRecord.and.returnValues(Promise.resolve(mockClient), Promise.resolve(mockReservation), Promise.resolve({}));

    component.selectedVols = [{ aller: { price: { total: '100' } }, retour: { price: { total: '100' } } }];
    component.onVoyageursSubmit(mockVoyageurs);

    tick();
    expect(component.reservationNumber).toBe('reservation-id');
    expect(component.stepCompleted[4]).toBeTrue();
    expect(component.selectedIndex).toBe(4);
    expect(component.isLoading).toBeFalse();
  }));

  it('should handle error during reservation process', fakeAsync(() => {
    const consoleSpy = spyOn(console, 'error');
    const mockVoyageurs = [{ email: 'test@example.com', nom: 'Doe', prenom: 'John', telephone: '123456789' }];

    airtableService.findRecordByEmail.and.returnValue(Promise.resolve({}));
    airtableService.createRecord.and.returnValue(Promise.reject('error'));

    component.selectedVols = [{ aller: { price: { total: '100' } }, retour: { price: { total: '100' } } }];
    component.onVoyageursSubmit(mockVoyageurs);

    tick();
    expect(consoleSpy).toHaveBeenCalledWith('Erreur lors de la sauvegarde de la réservation', 'error');
  }));

  it('should prevent tab change if the next step is not completed', () => {
    const event = { index: 2, preventDefault: jasmine.createSpy('preventDefault') };

    component.stepCompleted = [true, false, false, false, false];
    component.onTabChange(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.selectedIndex).toBe(0);
  });

  it('should allow tab change if the step is completed', () => {
    const event = { index: 1, preventDefault: jasmine.createSpy('preventDefault') };

    component.stepCompleted = [true, true, false, false, false];
    component.onTabChange(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(component.selectedIndex).toBe(1);
  });
});
