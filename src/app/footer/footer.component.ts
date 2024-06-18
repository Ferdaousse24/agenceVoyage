import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true
})
export class FooterComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const $ = require('jquery');
      $(document).ready(function() {
        $('#carouselPartners').carousel();
      });
    }
  }
}
