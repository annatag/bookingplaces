import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Offer } from '../offer.model';
import { OffersService } from '../offers.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit , OnDestroy{
  loadedMyOffers: Offer[];
  private offerSub: Subscription;

  constructor(
    private offersService: OffersService,
    private router: Router
  ) { }

  ngOnInit() {
      this.offerSub = this.offersService.offers.subscribe(offers => {
      this.loadedMyOffers = offers;
    });

  }
  onEdit(offerId: string, slidingItem: IonItemSliding){
    slidingItem.close();
    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit-offer', offerId]);
    console.log('Editing item', offerId);
  }


  ngOnDestroy() {
    if(this.offerSub){
      this.offerSub.unsubscribe();
    }
  }
}
