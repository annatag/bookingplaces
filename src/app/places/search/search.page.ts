import { Component, OnInit } from '@angular/core';
import { Place } from '../place.model';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  loadedPlaces: Place[];

  constructor(
    private placeService: PlacesService) { }

  ngOnInit() {
    this.loadedPlaces = this.placeService.places;
  }

}
