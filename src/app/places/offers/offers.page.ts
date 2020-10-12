import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding } from '@ionic/angular';
import { Offer } from '../offer.model';
import { OffersService } from '../offers.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit {
   loadedMyOffers: Offer[];

  constructor(
    private offersService: OffersService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadedMyOffers = this.offersService.offers;

  }
  onEdit(offerId: string, slidingItem: IonItemSliding){
    slidingItem.close();
    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit-offer', offerId]);
    console.log('Editing item', offerId);
  }

}
