import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import './locale'; // Importer le fichier de configuration de la locale
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
  
platformBrowserDynamic().bootstrapModule(AppComponent)
  .catch(err => console.error(err));
