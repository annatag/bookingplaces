import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OffersService } from '../../offers.service';
import { Offer } from '../../offer.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {
  offer: Offer;
  formEdit: FormGroup = new FormGroup({
    title: new FormControl(null, {
      updateOn: 'blur',
      validators: [Validators.required]
    }),
    description: new FormControl(null, {
      updateOn: 'blur',
      validators: [Validators.required, Validators.maxLength(180)]
    }),
    price: new FormControl(null, {
      updateOn: 'blur',
      validators: [Validators.required, Validators.min(1)]
    })
  });
  constructor(
    private route: ActivatedRoute,
    private offersService: OffersService,
    private navCtrl: NavController  ,
    private offerSub: Subscription
  ) {}

  ngOnInit() {
    
    this.route.paramMap.subscribe((paramMap) => {
      // if (!paramMap.has('offerId')) {
      //   this.navCtrl.navigateBack('/places/tabs/offers');
      //   return;
      // }
      // this.offer = this.offersService.getOffer(paramMap.get('offerId'));
      this.loadOffer(paramMap.get('offerId'));
     
    });
  }
  loadOffer(offerId: string) {
    if(!!offerId){
      this.offerSub = this.offersService.getOffer(offerId).subscribe( offer => {
        this.offer = offer;
      });
    }
    else{this.navCtrl.navigateBack('/places/tabs/offers');}
  }
  onEditOffer() {
    if (!this.formEdit.valid) {
      return;
    }
    console.log(this.formEdit);
  }

  ngOnDestroy() {
    if(this.offerSub){
      this.offerSub.unsubscribe();
    }
  }
}
