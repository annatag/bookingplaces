import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Offer } from '../../offer.model';
import { OffersService } from '../../offers.service';

@Component({
  selector: 'app-offer-detail',
  templateUrl: './offer-detail.page.html',
  styleUrls: ['./offer-detail.page.scss'],
})
export class OfferDetailPage implements OnInit {
   offer: Offer;
   constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private offersService: OffersService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('offerId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return ;
      }
      this.offer = this.offersService.getOffer(paramMap.get('offerId'));
    });
  }

}
