import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
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
  offerId: string;
  isLoading = false;
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
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('offerId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }
      this.offerId = paramMap.get('offerId');
      this.isLoading = true;
      this.offerSub = this.offersService
        .getOffer(paramMap.get('offerId'))
        .subscribe(offer => {
          this.offer = offer;
          this.formEdit = new FormGroup({
            title: new FormControl(this.offer.title, {
              updateOn: 'blur',
              validators: [Validators.required]
            }),
            description: new FormControl(this.offer.description, {
              updateOn: 'blur',
              validators: [Validators.required, Validators.maxLength(180)]
            }),
            price: new FormControl(this.offer.price, {
                  updateOn: 'blur',
                  validators: [Validators.required, Validators.min(1)],
                })
          });
          this.isLoading = false;
        }, error => {
          this.alertCtrl.create({
            header: 'An error occured!',
            message: 'Place could not be fetched, please try again later!',
            buttons: [{
              text: 'Okay',
            handler: () => {
              this.router.navigate(['places/tabs/offers']);
            }}]
          }).then(alertEl => {
            alertEl.present();
          })
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
