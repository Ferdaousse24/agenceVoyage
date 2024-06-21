import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-filtre-recherche-vols',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatAutocompleteModule, MatInputModule, MatSnackBarModule, MatTabsModule],
  templateUrl: './filtre-recherche-vols.component.html',
  styleUrls: ['./filtre-recherche-vols.component.css']
})
export class FiltreRechercheVolsComponent implements OnInit {
  @ViewChild('flightDetails') flightDetails!: ElementRef;
  @ViewChild('flightForm') flightForm!: NgForm;

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
    { code: 'CKY', name: 'Conakry, Guinee' },
    { code: 'OXB', name: 'Bissau, Guinee Bissau' },
    { code: 'RAI', name: 'Praia, Cap Vert' },
    { code: 'ABJ', name: 'Abidjan, Cote d\'Ivoire' },
    { code: 'YAO', name: 'Yaounde, Cameroun' },
    { code: 'DLA', name: 'Douala, Cameroun' },
    { code: 'FIH', name: 'Kinshasa, Republique démocratique Congo' },
    { code: 'ABV', name: 'Abuja, Nigeria' },
    { code: 'LOS', name: 'Lagos, Nigeria' },
    { code: 'KRT', name: 'Khartoum, Soudan' },
    { code: 'ADD', name: 'Addis ababa, Ethiopie' },
    { code: 'BKO', name: 'Bamako, Mali' },
    { code: 'NBO', name: 'Nairobi, Kenya' },
    { code: 'TNR', name: 'Antananarivo, Madagascar' },
    { code: 'YVA', name: 'Moroni, Comores' },
    { code: 'BJL', name: 'Banjul, Gambie' },
    { code: 'ACC', name: 'Accra, Ghana' },
    { code: 'NKC', name: 'Nouakchott, Mauritanie' },
    { code: 'TIP', name: 'Tripoli, Lybie' },
    { code: 'CAI', name: 'Le Caire, Egypte' },
    { code: 'HRG', name: 'Hurghada, Egypte' },
    { code: 'OUA', name: 'Ouagadougou, Burkina Faso' },
    { code: 'LBV', name: 'Libreville, Gabon' },
    { code: 'LAD', name: 'Luanda, Angola' },
    { code: 'FNA', name: 'Freetown, Sierra Leone' },
    { code: 'ASM', name: 'Asmara, Erythree' },
    { code: 'IST', name: 'Istanbul, Turquie' },
    { code: 'ANK', name: 'Ankara, Turquie' },
    { code: 'BJV', name: 'Bodrum-Milas, Turquie' },
    { code: 'AYT', name: 'Antalya, Turquie' },
    { code: 'GZT', name: 'Gaziantep, Turquie' },
    { code: 'RUH', name: 'Riyad, Arabie Saoudite' },
    { code: 'JED', name: 'Jeddah, Arabie Saoudite' },
    { code: 'MED', name: 'Medine, Arabie Saoudite' },
    { code: 'AUH', name: 'Abu Dhabi, Emirats Arabes Unis' },
    { code: 'DXB', name: 'Dubai, Emirats Arabes Unis' },
    { code: 'KWI', name: 'Koweït, Koweit' },
    { code: 'DOH', name: 'Doha, Qatar' },
    { code: 'MCT', name: 'Mascate, Oman' },
    { code: 'BAH', name: 'Manama, Bahrain' },
    { code: 'ISB', name: 'Islamabad, Pakistan' },
    { code: 'LHE', name: 'Lahore, Pakistan' },
    { code: 'KHI', name: 'Karachi, Pakistan' },
    { code: 'BKK', name: 'Bangkok, Thailande' },
    { code: 'HKT', name: 'Phuket, Thailande' },
    { code: 'KUL', name: 'Kuala Lumpur, Malaisie' },
    { code: 'CGK', name: 'Jakarta, Indonesie' },
    { code: 'ICN', name: 'Seoul, Corée du Sud' },
    { code: 'NRT', name: 'Tokyo, Japon' },
    { code: 'OSA', name: 'Osaka, Japon' },
    { code: 'PEK', name: 'Pekin, Chine' },
    { code: 'HAN', name: 'Hanoi, Cambodge' },
    { code: 'SGN', name: 'Hô Chi Minh, Cambodge' },
    { code: 'YOW', name: 'Ottawa, Canada' },
    { code: 'YYZ', name: 'Toronto, Canada' },
    { code: 'YQB', name: 'Quebec, Canada' },
    { code: 'YUL', name: 'Montréal, Canada' },
    { code: 'IAD', name: 'Washington, USA' },
    { code: 'NYC', name: 'New York, USA' }
];


  departureControl = new FormControl();
  destinationControl = new FormControl();
  departure = '';
  destination = '';
  tripType = 'one-way';
  showAdditionalFields = false;
  departureError = '';
  destinationError = '';

  departureDate: string = '';
  returnDate: string = '';
  adults: number = 1;
  children: number = 0;
  
  today: string = new Date().toISOString().split('T')[0];

  filteredOptions!: Observable<any[]>;
  filteredDestinationOptions!: Observable<any[]>;

  selectedIndex: number = 0;
  isTab2Enabled: boolean = false;

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.filteredOptions = this.departureControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterOptions(value, 'departure'))
    );

    this.filteredDestinationOptions = this.destinationControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterOptions(value, 'destination'))
    );

    this.departureControl.valueChanges.subscribe(value => {
      this.departure = this.getCityCode(value);
      this.updateFilteredOptions();
    });

    this.destinationControl.valueChanges.subscribe(value => {
      this.destination = this.getCityCode(value);
      this.updateFilteredOptions();
      this.onDestinationChange(); // Met à jour l'affichage des champs additionnels
    });
  }

  filterOptions(value: string, type: string): any[] {
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

  onSubmit() {
    this.departureError = '';
    this.destinationError = '';

    const departureCity = this.cities.find(city => city.name === this.departureControl.value);
    const destinationCity = this.cities.find(city => city.name === this.destinationControl.value);

    if (!departureCity) {
      this.departureError = 'La ville de départ n\'est pas valide.';
      this.showError(this.departureError);
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

    console.log('Recherche de vol :', {
      departure: this.departure,
      destination: this.destination,
      tripType: this.tripType,
      departureDate: this.departureDate,
      returnDate: this.returnDate,
      adults: this.adults,
      children: this.children
    });
    this.enableTab2(); // Active le deuxième onglet et affiche les détails du vol
  }

  showError(message: string) {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
    });
  }

  enableTab2() {
    this.isTab2Enabled = true;
    this.selectedIndex = 1; // Change l'index sélectionné pour afficher le deuxième onglet
  }

  onTabChange(event: any) {
    if (event.index === 0) {
      this.isTab2Enabled = false; // Désactive l'onglet 2 si on revient à l'onglet 1
    }
  }
}
