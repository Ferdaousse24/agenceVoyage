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
    return this.cities.filter(option => {
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
    const city = this.cities.find(c => c.name === cityName);
    return city ? city.code : '';
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
  
    const departureCity = this.cities.find(city => city.name === this.departureControl.value);
    const destinationCity = this.cities.find(city => city.name === this.destinationControl.value);
  
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
      console.log('Fetching flights with params:', {
        departure: this.departure,
        destination: this.destination,
        departureDate: this.departureDate,
        returnDate: this.returnDate,
        adults: this.adults,
        children: this.children
      });
  
      const today = new Date();
  
      // Fetch flights for the selected date and the six days around it
      for (let i = -3; i <= 3; i++) {
        const date = this.adjustDate(this.departureDate, i);
        const dateObj = new Date(date);
        if (dateObj >= today) {
          const dayFlights = await this.callAmadeus(this.departure, this.destination, date, this.adults);
          this.flights.push(...dayFlights);
        }
      }
  
      if (this.tripType === 'round-trip') {
        for (let i = -3; i <= 3; i++) {
          const date = this.adjustDate(this.returnDate, i);
          const dateObj = new Date(date);
          if (dateObj >= today) {
            const dayReturnFlights = await this.callAmadeus(this.destination, this.departure, date, this.adults);
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
  }
  
  private adjustDate(dateString: string, days: number): string {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }
  
  onSubmitBebe() {
    console.log("Baby form submitted");
    this.enableTab4();
  }

  async callAmadeus(departure: string, destination: string, date: string, adults: number): Promise<any[]> {
    const flightOffers = await this.amadeusService.searchFlights(departure, destination, date, adults);
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

  selectTraveler(index: number) {
    this.selectedTravelerIndex = index;
    this.selectedTravelerType = this.travelers[index].type;
  }

  cities = [
    { code: 'GVA', name: 'Geneve, Suisse' },
    { code: 'ZRH', name: 'Zurich, Suisse' },
    { code: 'LYS', name: 'Lyon, France' },
    { code: 'MRS', name: 'Marseille, France' },
    { code: 'PAR', name: 'Paris, France' },
    { code: 'MLH', name: 'Mulhouse, France' },
    { code: 'TLS', name: 'Toulouse, France' },
    { code: 'MPL', name: 'Montpellier, France' },
    { code: 'NCE', name: 'Nice, France' },
    { code: 'BOD', name: 'Bordeaux, France' },
    { code: 'ALG', name: 'Alger, Algerie' },
    { code: 'CZL', name: 'Constantine, Algerie' },
    { code: 'BJA', name: 'Bejaia, Algerie' },
    { code: 'QSF', name: 'Setif, Algerie' },
    { code: 'ORN', name: 'Oran, Algerie' },
    { code: 'BLJ', name: 'Batna, Algerie' },
    { code: 'BSK', name: 'Biskra, Algerie' },
    { code: 'TLM', name: 'Tlemcen, Algerie' },
    { code: 'TUN', name: 'Tunis, Tunisie' },
    { code: 'MIR', name: 'Monastir, Tunisie' },
    { code: 'DJE', name: 'Djerba, Tunisie' },
    { code: 'NBE', name: 'Enfidha, Tunisie' },
    { code: 'CMN', name: 'Casablanca, Maroc' },
    { code: 'TNG', name: 'Tanger, Maroc' },
    { code: 'RBA', name: 'Rabat, Maroc' },
    { code: 'RAK', name: 'Marrakech, Maroc' },
    { code: 'NDR', name: 'Nador, Maroc' },
    { code: 'FEZ', name: 'Fez, Maroc' },
    { code: 'DSS', name: 'Dakar, Senegal' },
    { code: 'LFW', name: 'Lome, Togo' },
    { code: 'CKY', name: 'Conakry, Guinée' },
    { code: 'OXB', name: 'Bissau, Guinée-Bissau' },
    { code: 'RAI', name: 'Praia, Cap-Vert' },
    { code: 'ABJ', name: 'Abidjan, Côte d\'Ivoire' },
    { code: 'YAO', name: 'Yaoundé, Cameroun' },
    { code: 'DLA', name: 'Douala, Cameroun' },
    { code: 'FIH', name: 'Kinshasa, République démocratique du Congo' },
    { code: 'ABV', name: 'Abuja, Nigeria' },
    { code: 'LOS', name: 'Lagos, Nigeria' },
    { code: 'KRT', name: 'Khartoum, Soudan' },
    { code: 'ADD', name: 'Addis-Abeba, Éthiopie' },
    { code: 'BKO', name: 'Bamako, Mali' },
    { code: 'NBO', name: 'Nairobi, Kenya' },
    { code: 'TNR', name: 'Antananarivo, Madagascar' },
    { code: 'YVA', name: 'Moroni, Comores' },
    { code: 'BJL', name: 'Banjul, Gambie' },
    { code: 'ACC', name: 'Accra, Ghana' },
    { code: 'NKC', name: 'Nouakchott, Mauritanie' },
    { code: 'TIP', name: 'Tripoli, Libye' },
    { code: 'CAI', name: 'Le Caire, Égypte' },
    { code: 'HRG', name: 'Hurghada, Égypte' },
    { code: 'OUA', name: 'Ouagadougou, Burkina Faso' },
    { code: 'LBV', name: 'Libreville, Gabon' },
    { code: 'LAD', name: 'Luanda, Angola' },
    { code: 'FNA', name: 'Freetown, Sierra Leone' },
    { code: 'ASM', name: 'Asmara, Érythrée' },
    { code: 'IST', name: 'Istanbul, Turquie' },
    { code: 'ANK', name: 'Ankara, Turquie' },
    { code: 'BJV', name: 'Bodrum-Milas, Turquie' },
    { code: 'AYT', name: 'Antalya, Turquie' },
    { code: 'GZT', name: 'Gaziantep, Turquie' },
    { code: 'RUH', name: 'Riyad, Arabie Saoudite' },
    { code: 'JED', name: 'Djeddah, Arabie Saoudite' },
    { code: 'MED', name: 'Médine, Arabie Saoudite' },
    { code: 'AUH', name: 'Abu Dhabi, Émirats Arabes Unis' },
    { code: 'DXB', name: 'Dubaï, Émirats Arabes Unis' },
    { code: 'KWI', name: 'Koweït, Koweït' },
    { code: 'DOH', name: 'Doha, Qatar' },
    { code: 'MCT', name: 'Mascate, Oman' },
    { code: 'BAH', name: 'Manama, Bahreïn' },
    { code: 'ISB', name: 'Islamabad, Pakistan' },
    { code: 'LHE', name: 'Lahore, Pakistan' },
    { code: 'KHI', name: 'Karachi, Pakistan' },
    { code: 'BKK', name: 'Bangkok, Thaïlande' },
    { code: 'HKT', name: 'Phuket, Thaïlande' },
    { code: 'KUL', name: 'Kuala Lumpur, Malaisie' },
    { code: 'CGK', name: 'Jakarta, Indonésie' },
    { code: 'ICN', name: 'Séoul, Corée du Sud' },
    { code: 'NRT', name: 'Tokyo, Japon' },
    { code: 'OSA', name: 'Osaka, Japon' },
    { code: 'PEK', name: 'Pékin, Chine' },
    { code: 'HAN', name: 'Hanoï, Vietnam' },
    { code: 'SGN', name: 'Hô Chi Minh-Ville, Vietnam' },
    { code: 'YOW', name: 'Ottawa, Canada' },
    { code: 'YYZ', name: 'Toronto, Canada' },
    { code: 'YQB', name: 'Québec, Canada' },
    { code: 'YUL', name: 'Montréal, Canada' },
    { code: 'IAD', name: 'Washington, USA' },
    { code: 'NYC', name: 'New York, USA' }
  ];
}
