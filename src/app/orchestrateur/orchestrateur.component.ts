import { Component, OnInit, Inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { FormRechercheVolsComponent } from '../form-recherche-vols/form-recherche-vols.component';
import { ListeVolsComponent } from '../liste-vols/liste-vols.component';
import { SelectedVolsComponent } from '../selected-vols/selected-vols.component';
import { PassagerComponent } from '../passager/passager.component';
import { PaymentComponent } from '../payment/payment.component';
import { AmadeusService } from '../services/amadeus.service';
import { AirtableService } from '../services/airtable.service';
import { PaymentService } from '../services/payment.service'; 
import { EmailService } from '../services/email.service';
import { v4 as uuidv4 } from 'uuid';

interface City {
  code: string;
  name: string;
}

@Component({
  selector: 'app-orchestrateur',
  templateUrl: './orchestrateur.component.html',
  styleUrls: ['./orchestrateur.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    FormRechercheVolsComponent,
    ListeVolsComponent,
    SelectedVolsComponent,
    PassagerComponent,
    PaymentComponent,
  ]
})
export class OrchestrateurComponent implements OnInit {
  selectedIndex = 0; // Par défaut, première étape active
  cities: City[] = []; // Liste des villes à fournir au composant de recherche
  isLoading: boolean = false;
  showRemerciement: boolean = false; // Contrôle l'affichage du message de remerciement

  parcours: any = {
    critere: null,
    vols: null,
    voyageurs: null
  }; // Objet parcours contenant les critères, les vols et les voyageurs

  selectedVols: any[] = [];
  villes: any[] = [];
  passagerData: any[] = []; // Contiendra les informations sur les passagers

  reservationNumber: string | null = null; // Numéro de réservation après confirmation
  totalAmount: number = 0; // Montant total à payer
  stepCompleted = [true, false, false, false, false]; // Suivi de l'état de chaque étape

  adultsCount: number = 0;
  childrenCount: number = 0;
  infantsCount: number = 0;

  constructor(
    private amadeusService: AmadeusService, 
    private airtableService: AirtableService,
    private paymentService: PaymentService,
    @Inject(EmailService) private emailService: EmailService
  ) {}

  ngOnInit() {
    this.loadCities();
  }

  loadCities() {
    this.airtableService.getCities().subscribe(cities => {
      this.cities = cities;
    }, error => {
      console.error('Error loading cities:', error);
    });
  }

  onCritereSubmit(critere: any) {
    this.isLoading = true;
    this.parcours.critere = critere;
    this.amadeusService.rechercherVolsAvecCritere(critere).then(vols => {
      this.parcours.vols = vols;
      this.stepCompleted[1] = true;
      this.isLoading = false;
      this.selectedIndex = 1; // Passer à l'étape de sélection des vols

      // Set the passenger counts based on the submitted criteria
      this.adultsCount = critere.adults || 0;
      this.childrenCount = critere.children || 0;
      this.infantsCount = critere.infants || 0;
    }).catch(error => {
      console.error('Erreur lors de la recherche des vols', error);
    });
  }

  onVolChoisi(volIndices: number[]) {
    const allerIndex = volIndices[0];
    const retourIndex = volIndices.length > 1 ? volIndices[1] : null;

    this.selectedVols = [{
        aller: this.parcours.vols.volsAlle[allerIndex],
        retour: retourIndex !== null ? this.parcours.vols.volsRetour[retourIndex] : null
    }];

    this.villes = [
        {
            code: this.parcours.critere.departureCity.code,
            name: this.parcours.critere.departureCity.name
        },
        {
            code: this.parcours.critere.destinationCity.code,
            name: this.parcours.critere.destinationCity.name
        }
    ];
    
    this.stepCompleted[2] = true;
    this.selectedIndex = 2;
  }

  onConfirmDetails() {
    // Calculer le montant total à payer
    this.totalAmount = this.selectedVols.reduce((total: number, vol: any) => {
      return total + parseFloat(vol.aller.price.total) + (vol.retour ? parseFloat(vol.retour.price.total) : 0);
    }, 0);

    this.stepCompleted[3] = true;
    this.selectedIndex = 3; // Passer à l'étape de saisie des informations voyageurs
  }

  async onVoyageursSubmit(voyageurs: any) {
    this.isLoading = true;
    this.passagerData = voyageurs;

    try {
        // Traite le client et attend que cette opération soit terminée
        const client = await this.saveClient(voyageurs[0]);
        const clientId = Array.isArray(client) ? client[0]?.fields?.client_id : client.fields.client_id;
       
        // Traite la réservation après que le client ait été créé ou récupéré
        const reservation = await this.saveReservation(clientId);

        // Enregistre les vols associés à cette réservation
        for (let vol of this.selectedVols) {
            await this.saveVol(vol.aller, reservation.id);
            if (vol.retour) {
                await this.saveVol(vol.retour, reservation.id);
            }
        }

        // Enregistre les passagers associés à cette réservation
        for (let passager of voyageurs) {
            await this.savePassager(passager, reservation.id);
        }

        this.reservationNumber = reservation.id;
        this.stepCompleted[4] = true;
        this.isLoading = false;
        this.selectedIndex = 4; // Passer à l'étape de paiement
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de la réservation', error);
    }
}

async saveClient(voyageur: any) {
    let client = await this.airtableService.findRecordByEmail(voyageur.email);

    if (!client || Object.keys(client).length === 0) {
        const clientData = {
            "fields": {
                "client_id": uuidv4(),
                "nom": voyageur.nom,
                "prenom": voyageur.prenom,
                "email": voyageur.email,
                "telephone": voyageur.telephone
            }
        };
        console.log(clientData);
        client = await this.airtableService.createRecord(clientData, 'Clients');
    }

    return client;
}

async saveReservation(clientId: string) {
  console.log('clientId: ', clientId);
    const reservationData = {
        "fields": {
            "reservation_id": uuidv4(),
            "client_id": clientId,
            "date_reservation": new Date().toISOString(),
            "departure": this.parcours.critere.departureCity.code,
            "destination": this.parcours.critere.destinationCity.code,
            "departure_date": this.parcours.critere.departureDate,
            "trip_type": this.parcours.critere.tripType,
            "status": "in progress",
            "prixTotal": this.totalAmount
        }
    };
    return await this.airtableService.createRecord(reservationData, 'Reservations');
}

async saveVol(vol: any, reservationId: string) {
    const volData = {
        "fields": {
            "vol_id": uuidv4(),
            "reservation_id": reservationId,
            "departure_code": vol.departure.iataCode,
            "destination_code": vol.arrival.iataCode,
            "carrier": vol.carrierCode,
            "price": parseFloat(vol.price.total),
            "departure_time": vol.departure.at,
            "arrival_time": vol.arrival.at,
            "duration": vol.duration,
            "stops": vol.numberOfStops,
            "available": true
        }
    };
    return await this.airtableService.createRecord(volData, 'Vols');
}

async savePassager(passager: any, reservationId: string) {
    const passagerData = {
        "fields": {
            "passager_id": uuidv4(),
            "reservation_id": reservationId,
            "type": passager.type,
            "titre": passager.titre,
            "prenom": passager.prenom,
            "nom": passager.nom,
            "nationalite": passager.nationalite,
            "date_naissance": passager.dateNaissance,
            "numero_passeport": passager.numeroPasseport,
            "telephone": passager.telephone,
            "email": passager.email
        }
    };
    return await this.airtableService.createRecord(passagerData, 'Passagers');
}


  onPaiementSubmit(paiement: any) {
    this.sendConfirmationEmail();

    // Effacer le parcours et afficher le message de remerciement
    this.parcours = null;
    this.showRemerciement = true;
    this.selectedIndex = -1; // Désactiver tous les onglets après paiement
  }

  sendConfirmationEmail() {
    console.log('Email de confirmation envoyé');
  }

  onTabChange(event: any) {
    if (event.index > this.selectedIndex) {
      event.preventDefault();
    } else {
      this.selectedIndex = event.index;
    }
  }
}
