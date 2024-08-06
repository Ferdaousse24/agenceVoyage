import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { VoyageurComponent } from '../voyageur/voyageur.component';
import { RecuperationVolsComponent } from '../recuperation-vols/recuperation-vols.component';
import { AmadeusService } from '../services/amadeus.service';
import { PaiementComponent } from '../paiement/paiement.component';
import { LOCALE_ID } from '@angular/core';
import { cities } from '../filtre-recherche-vols/cities'; // Importation des villes
import { AirtableService } from '../services/airtable.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-filtre-recherche-vols',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    VoyageurComponent,
    RecuperationVolsComponent,
    PaiementComponent
  ],
  templateUrl: './filtre-recherche-vols.component.html',
  styleUrls: ['./filtre-recherche-vols.component.css'],
  providers: [{ provide: LOCALE_ID, useValue: 'fr' }]
})
export class FiltreRechercheVolsComponent implements OnInit {
  adults = 1; // Valeur initiale pour le nombre d'adultes
  adultsOptions: string[] = [];
  nationalityControl = new FormControl();
  filteredNationalities!: Observable<string[]>;
  nationalities: string[] = ['Française', 'Canadienne', 'Américaine', 'Algérienne', 'Marocaine']; // Ajoutez plus de nationalités ici

  travelersForms: FormGroup[] = []; // Formulaires pour les voyageurs
  allPassengerData: any[] = []; // Stocker les données de tous les passagers
  clientId: string = ''; // ID du client
  reservationId: string = ''; // ID du reservation
  selectedOutboundFlight: any = null; // Vol aller sélectionné
  selectedInboundFlight: any = null; // Vol retour sélectionné

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar, private amadeusService: AmadeusService, private airtableService: AirtableService) {
    this.updateAdultsOptions();
  }

  ngOnInit() {
    this.filteredOptions = this.departureControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterOptions(value, 'departure'))
    );

    this.filteredDestinationOptions = this.destinationControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterOptions(value, 'destination'))
    );

    this.filteredNationalities = this.nationalityControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterNationalities(value))
    );

    this.departureControl.valueChanges.subscribe(value => {
      this.departure = this.getCityCode(value);
      this.updateFilteredOptions();
    });

    this.destinationControl.valueChanges.subscribe(value => {
      this.destination = this.getCityCode(value);
      this.updateFilteredOptions();
      this.onDestinationChange();
    });
    this.travelers = this.getTravelers();
    this.initializeTravelerForms();
  }

  private _filterNationalities(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.nationalities.filter(option => option.toLowerCase().includes(filterValue));
  }

  updateAdultsOptions() {
    this.adultsOptions = Array.from({ length: this.adults }, (_, i) => `Adulte ${i + 1}`);
  }

  onAdultsChange(event: any) {
    this.adults = event.target.value;
    this.updateAdultsOptions();
    this.travelers = this.getTravelers();
    this.initializeTravelerForms();
  }

  selectedIndex: number = 0;
  isTab2Enabled: boolean = false;
  isTab3Enabled: boolean = false;
  isTab4Enabled: boolean = false;
  flights: any[] = [];
  returnFlights: any[] = [];
  departure: string = '';
  destination: string = '';
  departureDate: string = '';
  returnDate: string = '';
  tripType: string = 'one-way';
  totalPrice: number = 0;
  adulte: number = 1;
  children: number = 0;
  infants: number = 0;
  travelers: any[] = [];
  isLoading: boolean = false;
  showAdditionalFields: boolean = false;
  departureControl = new FormControl();
  destinationControl = new FormControl();
  filteredOptions!: Observable<any[]>;
  filteredDestinationOptions!: Observable<any[]>;
  today: string = new Date().toISOString().split('T')[0];
  departureError: string = '';
  destinationError: string = '';
  selectedTravelerIndex: number = 0;
  selectedTravelerType: string = 'Adulte';
  paymentMessage: string = '';
  agencyFee: number = 40;

  filterOptions(value: string, type: string): any[] {
    if (!value) {
      return [];
    }
    const filterValue = value.toLowerCase();
    return cities.filter(option => {
      const match = option.name.toLowerCase().includes(filterValue);
      if (type === 'departure') {
        return match && option.code !== this.destination;
      } else {
        return match && option.code !== this.departure;
      }
    });
  }

  getCityCode(cityName: string): string {
    if (!cityName) {
      return '';
    }
    const city = cities.find(c => c.name === cityName);
    return city ? city.code : '';
  }
  getCityName(code: string): string {
    const city = cities.find(c => c.code === code);
    return city ? city.name : code;
  }

  updateFilteredOptions() {
    this.filteredOptions = of(this.filterOptions(this.departureControl.value, 'departure'));
    this.filteredDestinationOptions = of(this.filterOptions(this.destinationControl.value, 'destination'));
  }

  onDepartureSelected(event: any) {
    this.departure = this.getCityCode(event.option.value);
    this.updateFilteredOptions();
  }

  onDestinationSelected(event: any) {
    this.destination = this.getCityCode(event.option.value);
    this.updateFilteredOptions();
  }

  onDestinationChange() {
    this.showAdditionalFields = !!this.destination;
  }

  onTripTypeChange() {
    if (this.tripType === 'one-way') {
      this.returnDate = '';
    }
  }

  toggleFields() {
    this.showAdditionalFields = !this.showAdditionalFields;
  }

  async onSubmit() {
    this.departureError = '';
    this.destinationError = '';

    const departureCity = cities.find(city => city.name === this.departureControl.value);
    const destinationCity = cities.find(city => city.name === this.destinationControl.value);

    if (!departureCity) {
      this.departureError = 'La ville de départ n\'est pas valide.';
      this.showError(this.departureError);
      return;
    }

    if (!destinationCity) {
      this.destinationError = 'La ville de destination n\'est pas valide.';
      this.showError(this.destinationError);
      return;
    }

    if (this.departure === this.destination) {
      this.destinationError = 'La ville de départ ne peut pas être la même que la ville d\'arrivée.';
      this.showError(this.destinationError);
      return;
    }

    if (this.tripType === 'round-trip' && this.returnDate <= this.departureDate) {
      this.destinationError = 'La date de retour doit être supérieure à la date de départ.';
      this.showError(this.destinationError);
      return;
    }

    this.isLoading = true;
    this.flights = [];
    this.returnFlights = [];

    try {
      const today = new Date();
      let startDate = new Date(this.departureDate);
      let returnStartDate = new Date(this.returnDate);

      const threeDaysLater = new Date(today);
      threeDaysLater.setDate(today.getDate() + 3);

      if (new Date(this.departureDate) <= today) {
        startDate = today;
      } else if (new Date(this.departureDate).getTime() - today.getTime() <= 24 * 60 * 60 * 1000) {
        startDate = today;
      } else if (new Date(this.departureDate).getTime() - today.getTime() <= 2 * 24 * 60 * 60 * 1000) {
        startDate = today;
      } else if (new Date(this.departureDate) >= threeDaysLater) {
        startDate.setDate(startDate.getDate() - 3);
      }

      // Fetch flights for the selected date and the six days around it
      for (let i = 0; i < 7; i++) {
        const date = this.adjustDate(startDate, i);
        const dayFlights = await this.callAmadeus(this.departure, this.destination, date, this.adults, this.children, this.infants);
        if (dayFlights.length === 0) {
          this.flights.push({
            departureCode: this.departure,
            destinationCode: this.destination,
            date,
            available: false,
            carrier: '',
            price: 0,
            departureTime: date,
            arrivalTime: '',
            duration: '',
            stops: 0
          });
        } else {
          this.flights.push(...dayFlights);
        }
      }

      if (this.tripType === 'round-trip') {
        const returnThreeDaysLater = new Date(today);
        returnThreeDaysLater.setDate(today.getDate() + 3);

        if (new Date(this.returnDate) <= today) {
          returnStartDate = today;
        } else if (new Date(this.returnDate).getTime() - today.getTime() <= 24 * 60 * 60 * 1000) {
          returnStartDate = today;
        } else if (new Date(this.returnDate).getTime() - today.getTime() <= 2 * 24 * 60 * 60 * 1000) {
          returnStartDate = today;
        } else if (new Date(this.returnDate) >= returnThreeDaysLater) {
          returnStartDate.setDate(returnStartDate.getDate() - 3);
        }
        for (let i = 0; i < 7; i++) {
          const date = this.adjustDate(returnStartDate, i);
          const dayReturnFlights = await this.callAmadeus(this.destination, this.departure, date, this.adults, this.children, this.infants);
          if (dayReturnFlights.length === 0) {
            this.returnFlights.push({
              departureCode: this.destination,
              destinationCode: this.departure,
              date,
              available: false,
              carrier: '',
              price: 0,
              departureTime: date,
              arrivalTime: '',
              duration: '',
              stops: 0
            });
          } else {
            this.returnFlights.push(...dayReturnFlights);
          }
        }
      }

      this.isTab2Enabled = true;
      this.selectedIndex = 1;
    } catch (error) {
      console.error('Error fetching flight offers:', error);
      this.showError('Erreur lors de la recherche des vols.');
    } finally {
      this.isLoading = false;
    }

    this.travelers = this.getTravelers(); // Initialize travelers array based on the number of adults and children
    this.initializeTravelerForms(); // Initialize traveler forms based on the number of travelers
  }

  private adjustDate(startDate: Date, days: number): string {
    const date = new Date(startDate);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  onFormValid() {
    this.getOrCreateClientId()
      .then(clientId => {
        this.clientId = clientId;
        this.createReservation()
          .then(reservationId => {
            this.reservationId = reservationId;
            this.persistAllPassengers();
            this.persistAllVols();
          })
          .catch(error => {
            console.error('Erreur lors de la création ou de la récupération de la reservation:', error);
          });
      })
      .catch(error => {
        console.error('Erreur lors de la création ou de la récupération du client:', error);
      });
  }

  async getOrCreateClientId(): Promise<string> {
    try {
      const email = this.allPassengerData.length > 0 ? this.allPassengerData[0].email : '';
      const records = await this.airtableService.findRecordByEmail(email);
      if (records.length > 0) {
        return records[0].fields.client_id;
      } else {
        const newClientId = uuidv4();
        const newClient = {
          records: [
            {
              fields: {
                client_id: newClientId,
                nom: this.allPassengerData[0].nom,
                prenom: this.allPassengerData[0].prenom,
                email: email,
                telephone: this.allPassengerData[0].telephone
              }
            }
          ]
        };

        console.log('Client Info à envoyer:', newClient);
        await this.airtableService.createRecord(newClient, 'Clients');
        return newClientId;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification/création du client:', error);
      throw error;
    }
  }

  async createReservation(): Promise<string> {
    try {
      const reservationId = uuidv4();
      const reservationDate = new Date().toISOString();

      const reservationInfo = {
        records: [
          {
            fields: {
              reservation_id: reservationId,
              client_id: this.clientId,
              date_reservation: reservationDate,
              departure: this.departure,
              destination: this.destination,
              departure_date: this.departureDate,
              return_date: this.tripType === 'round-trip' ? this.returnDate : null,
              trip_type: this.tripType,
              status: 'in progress',
              prixTotal: this.totalPrice
            }
          }
        ]
      };

      console.log('Reservation Info à envoyer:', reservationInfo);

      await this.airtableService.createRecord(reservationInfo, 'Reservations');
      return reservationId;
    } catch (error) {
      console.error('Erreur lors de la vérification/création de la reservation:', error);
      throw error;
    }
  }

  persistAllPassengers() {
    try {
      const passengerRecords = this.allPassengerData.map(passenger => ({
        fields: {
          passager_id: uuidv4(),
          reservation_id: this.reservationId,
          type: passenger.type,
          titre: passenger.titre,
          prenom: passenger.prenom,
          nom: passenger.nom,
          nationalite: passenger.nationalite,
          date_naissance: passenger.dateNaissance,
          numero_passeport: passenger.numeroPasseport,
          telephone: passenger.telephone,
          email: passenger.email,
          voyager_avec: ''
        }
      }));
  
      const passengerInfo = { records: passengerRecords };  
      console.log('Passenger Info à envoyer:', passengerInfo);  
      this.airtableService.createRecord(passengerInfo, 'Passagers');
    } catch(error) {
      console.error('Erreur lors de l\'enregistrement des passagers:', error);
      throw error;
    }
  }

  persistAllVols() {
    const flightRecords = [];
  
    const outboundFlightInfo = {
      fields: {
        vol_id: uuidv4(),
        reservation_id: this.reservationId,
        departure_code: this.departure,
        destination_code: this.destination,
        carrier: this.selectedOutboundFlight?.carrier || '',
        price: this.selectedOutboundFlight?.price || 0,
        departure_time: this.selectedOutboundFlight?.departureTime || this.departureDate + 'T14:26:39.000Z',
        arrival_time: this.selectedOutboundFlight?.arrivalTime || '',
        duration: this.selectedOutboundFlight?.duration || 150,
        stops: this.selectedOutboundFlight?.stops || 0,
        available: this.selectedOutboundFlight?.available || true
      }
    };
  
    flightRecords.push(outboundFlightInfo);
  
    if (this.tripType === 'round-trip') {
      const inboundFlightInfo = {
        fields: {
          vol_id: uuidv4(),
          reservation_id: this.reservationId,
          departure_code: this.destination,
          destination_code: this.departure,
          carrier: this.selectedInboundFlight?.carrier || '',
          price: this.selectedInboundFlight?.price || 0,
          departure_time: this.selectedInboundFlight?.departureTime || this.returnDate + 'T14:26:39.000Z',
          arrival_time: this.selectedInboundFlight?.arrivalTime || '',
          duration: this.selectedInboundFlight?.duration || 150,
          stops: this.selectedInboundFlight?.stops || 0,
          available: this.selectedInboundFlight?.available || true
        }
      };
  
      flightRecords.push(inboundFlightInfo);
    }
  
    const flightInfo = { records: flightRecords };
  
    console.log('Flight Info à envoyer:', flightInfo);
  
    this.airtableService.createRecord(flightInfo, 'Vols').then(() => {
      this.enableTab4();
    });
  }

  savePassengerData(passengerData: any) {
    this.allPassengerData.push(passengerData);
  }

  selectTraveler(index: number) {
    this.selectedTravelerIndex = index;
    this.selectedTravelerType = this.travelers[index].type;
  }

  async callAmadeus(departure: string, destination: string, date: string, adults: number, childrens: number, infants: number): Promise<any[]> {
    console.log("enfants");
    const flightOffers = await this.amadeusService.searchFlights(departure, destination, date, adults, childrens, infants);
    return flightOffers.data.map((offer: any) => {
      const segments = offer.itineraries[0].segments;
      const departureSegment = segments[0];
      const arrivalSegment = segments[segments.length - 1];

      return {
        departureCode: departureSegment.departure.iataCode,
        destinationCode: arrivalSegment.arrival.iataCode,
        carrier: offer.validatingAirlineCodes[0],
        price: parseFloat(offer.price.total), // Ensure price is a number
        departureTime: departureSegment.departure.at,
        arrivalTime: arrivalSegment.arrival.at,
        duration: offer.itineraries[0].duration,
        stops: segments.length - 1,
        date: departureSegment.departure.at,
        available: true
      };
    });
  }

  showError(message: string) {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
    });
  }

  enableTab3() {
    this.isTab3Enabled = true;
    this.selectedIndex = 2;
  }

  enableTab4() {
    this.isTab4Enabled = true;
    this.selectedIndex = 3;
    this.paymentMessage = "Veuillez cliquer sur le bouton ci-dessous pour procéder au paiement.";
  }

  onSelectedFlightChange(flight: any) {
    console.log('Selected flight:', flight);
    if (this.tripType === 'one-way') {
      this.selectedOutboundFlight = flight.selectedOutboundFlight;
    } else if (this.tripType === 'round-trip') {
      this.selectedOutboundFlight = flight.selectedOutboundFlight;
      this.selectedInboundFlight = flight.selectedInboundFlight;      
    }
    this.totalPrice = this.calculateTotalPrice();
  }

  calculateTotalPrice(): number {
    let totalPrice = 0;

    if (this.selectedOutboundFlight && this.selectedInboundFlight) {
      totalPrice = parseFloat(this.selectedOutboundFlight.price as any) + parseFloat(this.selectedInboundFlight.price as any) + (this.agencyFee * 2);
    } else if (this.selectedOutboundFlight) {
      totalPrice = parseFloat(this.selectedOutboundFlight.price as any) + this.agencyFee;
    }

    return parseFloat(totalPrice.toFixed(2));
  }

  onFlightSelected() {
    this.enableTab3();
  }

  onTabChange(event: any) {
    if (event.index === 0) {
      this.isTab2Enabled = false;
      this.isTab3Enabled = false;
      this.isTab4Enabled = false;
    } else if (event.index === 1) {
      this.isTab3Enabled = false;
      this.isTab4Enabled = false;
    } else if (event.index === 2) {
      this.isTab4Enabled = false;
    }
  }

  getTravelers(): any[] {
    const travelers = [];
    for (let i = 0; i < this.adults; i++) {
      travelers.push({ type: 'Adulte' });
    }
    for (let i = 0; i < this.children; i++) {
      travelers.push({ type: 'Enfant' });
    }
    for (let i = 0; i < this.infants; i++) {
      travelers.push({ type: 'Bébé' });
    }
    return travelers;
  }

  initializeTravelerForms() {
    this.travelersForms = this.travelers.map(traveler => {
      return this.fb.group({
        type: [traveler.type, Validators.required],
        titre: ['', Validators.required],
        prenom: ['', Validators.required],
        nom: ['', Validators.required],
        nationalite: ['', Validators.required],
        dateNaissance: ['', Validators.required],
        numeroPasseport: ['', [Validators.required, Validators.pattern('^[0-9A-Z]{9}$')]],
        telephone: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]]
      });
    });
  }

  onNextTraveler(index: number) {
    if (index < this.travelers.length - 1) {
      this.selectedTravelerIndex = index + 1;
    }
  }
}