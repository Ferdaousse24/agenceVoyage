import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import './locale'; // Importer le fichier de configuration de la locale

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error('Error during bootstrap: ', err));