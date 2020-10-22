import { NumberFormatStyle } from '@angular/common';
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  ActionSheetController,
  LoadingController,
  ModalController,
  NavController,
  AlertController
} from "@ionic/angular";
import { Subscription } from "rxjs";
import { MapModalComponent } from 'src/app/shared/map-modal/map-modal.component';
import { AuthService } from '../../../auth/auth.service';
import { BookingService } from "../../../bookings/booking.service";
import { CreateBookingComponent } from "../../../bookings/create-booking/create-booking.component";
import { Place } from "../../place.model";
import { PlacesService } from "../../places.service";

@Component({
  selector: "app-place-detail",
  templateUrl: "./place-detail.page.html",
  styleUrls: ["./place-detail.page.scss"],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  isLoading = false;
  private placeSub: Subscription;
  isBookable = false;
  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private placesService: PlacesService,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/search');
        return;
      }
      this.isLoading = true;
      this.placeSub = this.placesService
        .getPlace(paramMap.get('placeId'))
        .subscribe((place) => {
          this.place = place;
          this.isBookable = place.userId !== this.authService.userId;
          this.isLoading = false;
        }, error => {
          this.alertCtrl
          .create({
            header: 'An error occured!',
            message: 'Could not load place.',
            buttons: [
              { 
                text: 'Okay',
                handler: () => {
                  this.router.navigate(['places/tabs/search']);
                }
              }
            ]
          }).then(alertEl => alertEl.present());
        }
      );
    });
  }
  onBookPlace() {
    //this.router.navigateByUrl('/places/tabs/search');
    // this.navCtrl.navigateBack('/places/tabs/search');
    //this.navCtrl.pop();
    this.actionSheetCtrl
      .create({
        header: "Choose an Action",
        buttons: [
          {
            text: "Select Date",
            handler: () => {
              this.openBookingModal("select");
            },
          },
          {
            text: "Random Date",
            handler: () => {
              this.openBookingModal("random");
            },
          },
          { text: "Cancel", role: "cancel" },
        ],
      })
      .then((actionSheetEl) => {
        actionSheetEl.present();
      });
  }

  openBookingModal(mode: "select" | "random") {
    console.log(mode);
    this.modalCtrl
      .create({
        component: CreateBookingComponent,
        componentProps: { selectedPlace: this.place, selectedMode: mode },
      })
      .then((modalEl) => {
        modalEl.present();
        return modalEl.onDidDismiss();
      })
      .then((resultData) => {
        console.log(resultData.data, resultData.role);
        if (resultData.role === "confirm") {
          this.loadingCtrl
            .create({
              message: "Booking place..."})
            .then(loadingEl => {
              loadingEl.present();
              const data = resultData.data.bookingData;
              console.log("BOOKED!");
              this.bookingService
                .addBooking(
                  this.place.id,
                  this.place.title,
                  this.place.imageUrl,
                  data.firstName,
                  data.lastName,
                  data.guestNumber,
                  data.startDate,
                  data.endDate
                )
                .subscribe(() => {
                  loadingEl.dismiss();
                });
            });
        }
      });
  }

  onShowFullMap(){
    this.modalCtrl.create({
      component: MapModalComponent,
      componentProps: {
      center: {
        lat: this.place.location.latitude,
        lng: this.place.location.longitude},
      selectable: false,
      closeButtonText: 'Close',
      title: this.place.location.address
      } 
    }).then( modalEl => {
      modalEl.present();
    });
  }
  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
