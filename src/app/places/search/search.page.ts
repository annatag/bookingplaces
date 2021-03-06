import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Place } from '../place.model';
import { PlacesService } from '../places.service';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit, OnDestroy {
  loadedPlaces: Place[];
  listedLoadedPlaces: Place [];
  relevantPlaces: Place[];
  isLoading = false;
  private placeSub: Subscription;


  constructor(
    private placeService: PlacesService,
    private menuCtrl: MenuController,
    private authService: AuthService) { }

  ngOnInit() {
    this.placeSub = this.placeService.places.subscribe(places => {
      this.loadedPlaces = places;
      this.relevantPlaces = this.loadedPlaces;
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    });
  }


ionViewWillEnter() {
  this.isLoading = true;
  this.placeService.fetchPlaces().subscribe(() => {this.isLoading = false;});
}

  onOpenMenu() {
this.menuCtrl.toggle('m1');
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>){
    this.authService.userId.pipe(take(1)).subscribe(userId => {
      if (event.detail.value === 'all') {
        this.relevantPlaces = this.loadedPlaces;
        this.listedLoadedPlaces = this.relevantPlaces.slice(1);
      } else {
        this.relevantPlaces = this.loadedPlaces.filter(
          place => place.userId !== userId
        );
        this.listedLoadedPlaces = this.relevantPlaces.slice(1);
      }
    });
    
    console.log(event.detail);
    console.log(this.relevantPlaces);
  }

  ngOnDestroy() {
    if (this.placeSub){
      this.placeSub.unsubscribe();
    }
  }
}
