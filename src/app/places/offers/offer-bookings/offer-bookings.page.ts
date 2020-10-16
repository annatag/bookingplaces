import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NavController } from "@ionic/angular";
import { Subscription } from "rxjs";
import { Offer } from "../../offer.model";
import { OffersService } from "../../offers.service";

@Component({
  selector: "app-offer-bookings",
  templateUrl: "./offer-bookings.page.html",
  styleUrls: ["./offer-bookings.page.scss"],
})
export class OfferBookingsPage implements OnInit, OnDestroy {
  offer: Offer;
  private offerSub: Subscription;
  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private offerService: OffersService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      if (!paramMap.has("offerId")) {
        this.navCtrl.navigateBack("places/tabs/offers");
        return;
      }
      this.offerSub = this.offerService
        .getOffer(paramMap.get("offerId"))
        .subscribe((offer) => {
          this.offer = offer;
        });
    });
  }

  ngOnDestroy() {
    if (this.offerSub){
      this.offerSub.unsubscribe();
    }
  }
}
