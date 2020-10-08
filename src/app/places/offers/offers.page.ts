import { Component, OnInit } from '@angular/core';
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
    private offersService: OffersService
  ) { }

  ngOnInit() {
    this.loadedMyOffers = this.offersService.offers;

  }

}
