import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
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
  private offerSub: Subscription;
  formEdit: FormGroup = new FormGroup({
    title: new FormControl(null, {
      updateOn: 'blur',
      validators: [Validators.required],
    }),
    description: new FormControl(null, {
      updateOn: 'blur',
      validators: [Validators.required, Validators.maxLength(180)],
    }),
    price: new FormControl(null, {
      updateOn: 'blur',
      validators: [Validators.required, Validators.min(1)],
    }),
  });
  constructor(
    private route: ActivatedRoute,
    private offersService: OffersService,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      if (!paramMap.has('offerId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }
      this.offerSub = this.offersService
        .getOffer(paramMap.get('offerId'))
        .subscribe(offer => {
          this.offer = offer;
        });
      // this.loadOffer(paramMap.get("offerId"));
    });
  }
  // loadOffer(offerId: string) {
  //   if (!!offerId) {
  //     this.offerSub = this.offersService
  //       .getOffer(offerId)
  //       .subscribe((offer) => {
  //         this.offer = offer;
  //       });
  //   } else {
  //     this.navCtrl.navigateBack("/places/tabs/offers");
  //   }
  // }
  onEditOffer() {
    // if (!this.formEdit.valid) {
    //   return;
    // }
    this.loadingCtrl
      .create({
        message: 'Updating offer...'
      })
      .then(loadingEl => {
        loadingEl.present();
        this.offersService
          .updateOffer(
            this.offer.id,
            this.formEdit.value.title,
            this.formEdit.value.description,
            this.formEdit.value.price
          )
          .subscribe(() => {
            loadingEl.dismiss();
            this.formEdit.reset();
            this.router.navigate(['/places/tabs/offers']);
          });
      });
    console.log(this.formEdit);
  }

  ngOnDestroy() {
    if (this.offerSub) {
      this.offerSub.unsubscribe();
    }
  }
}
