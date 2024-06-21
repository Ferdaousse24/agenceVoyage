import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './footer/footer.component';
import { RecuperationVolsComponent } from './recuperation-vols/recuperation-vols.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterOutlet, FooterComponent, RecuperationVolsComponent]
})
export class AppComponent {
  title = 'agenceVoyage';
}
