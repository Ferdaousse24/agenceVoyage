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

  bebeForm: FormGroup; // Ajout du formulaire bébé
  filteredNationalitiesBebe: string[] = []; // Ajout pour le filtre de nationalité du bébé
  maxBirthDate: string = new Date().toISOString().split('T')[0]; // Définir la date maximale comme aujourd'hui

  travelersForms: FormGroup[] = []; // Formulaires pour les voyageurs

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar, private amadeusService: AmadeusService) {
    this.updateAdultsOptions();
    this.bebeForm = this.fb.group({
      voyagerAvec: ['', Validators.required],
      prenomBebe: ['', Validators.required],
      nomBebe: ['', Validators.required],
      nationaliteBebe: ['', Validators.required],
      dateNaissanceBebe: ['', Validators.required]
    });
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

  filterNationalitiesBebe(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    if (input) {
      this.filteredNationalitiesBebe = this.nationalities.filter(n =>
        n.toLowerCase().includes(input.toLowerCase())
      );
    } else {
      this.filteredNationalitiesBebe = [];
    }
  }

  selectNationalityBebe(nationality: string) {
    this.bebeForm.patchValue({ nationaliteBebe: nationality });
    this.filteredNationalitiesBebe = [];
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
      console.log(startDate);
      // Fetch flights for the selected date and the six days around it
      for (let i = 0; i < 7; i++) {
        const date = this.adjustDate(startDate, i);
        const dayFlights = await this.callAmadeus(this.departure, this.destination, date, this.adults);
        console.log(date, " : ", dayFlights)
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
      console.log(this.flights);

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
        console.log(returnStartDate);
        for (let i = 0; i < 7; i++) {
          const date = this.adjustDate(returnStartDate, i);
          const dayReturnFlights = await this.callAmadeus(this.destination, this.departure, date, this.adults);
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
        console.log(this.returnFlights);
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

  onFormValid(index: number) {
    if (index === this.travelers.length - 1) {
      this.enableTab4();
    } else {
      this.selectTraveler(index + 1);
    }
  }

  selectTraveler(index: number) {
    this.selectedTravelerIndex = index;
    this.selectedTravelerType = this.travelers[index].type;
  }
  
  onSubmitBebe() {
    console.log("Baby form submitted");
    this.enableTab4();
  }

  async callAmadeus(departure: string, destination: string, date: string, adults: number): Promise<any[]> {
    const flightOffers = await this.amadeusService.searchFlights(departure, destination, date, adults);
    //console.log(flightOffers);
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
}