import { HttpClient } from "@angular/common/http";
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { Capacitor, Plugins } from "@capacitor/core";
import {
  ActionSheetController,
  AlertController,
  ModalController,
} from "@ionic/angular";
import { of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { PlaceLocation, Coordinates } from "../../../places/location.model";
import { environment } from "../../../../environments/environment";
import { MapModalComponent } from "../../map-modal/map-modal.component";

@Component({
  selector: "app-location-picker",
  templateUrl: "./location-picker.component.html",
  styleUrls: ["./location-picker.component.scss"],
})
export class LocationPickerComponent implements OnInit {
  selectedLocationImage: string;
  isLoading = false;
  @Output() locationPick = new EventEmitter<PlaceLocation>();
  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private actionSheet: ActionSheetController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {}

  onPickLocation() {
    this.actionSheet
      .create({
        header: "Please Chhose",
        buttons: [
          {
            text: "Auto-Locate",
            handler: () => {
              this.locateUser();
            },
          },
          {
            text: "Pick on Map",
            handler: () => {
              this.openMap();
            },
          },
          {
            text: "Cancel",
            role: "cancel",
          },
        ],
      })
      .then((actionSheetEl) => {
        actionSheetEl.present();
      });
    }
  //   this.modalCtrl
  //     .create({
  //       component: MapModalComponent,
  //     })
  //     .then((modalEl) => {
  //       modalEl.onDidDismiss().then((modalData) => {
  //         if (!modalData.data) {
  //           return;
  //         }
  //         const pickedLocation: PlaceLocation = {
  //           latitude: modalData.data.latitude,
  //           longitude: modalData.data.longitude,
  //           address: null,
  //           staticMapImageUrl: null,
  //         };
  //         this.isLoading = true;
  //         this.getAddress(modalData.data.latitude, modalData.data.longitude)
  //           .pipe(
  //             switchMap((address) => {
  //               pickedLocation.address = address;
  //               // pickedLocation.staticMapImageUrl
  //               return of(
  //                 this.getMapImage(
  //                   pickedLocation.latitude,
  //                   pickedLocation.longitude,
  //                   14
  //                 )
  //               );
  //             })
  //           )
  //           .subscribe((staticMapImageUrl) => {
  //             pickedLocation.staticMapImageUrl = staticMapImageUrl;
  //             this.selectedLocationImage = staticMapImageUrl;
  //             this.isLoading = false;
  //             this.locationPick.emit(pickedLocation);
  //           });
  //         console.log(modalData.data);
  //       });
  //       modalEl.present();
  //     });
  // }
  private locateUser() {
    if (!Capacitor.isPluginAvailable("Geolocation")) {
      this.showErrorAlert();
      return;
    }
    this.isLoading  = true; 
    Plugins.Geolocation.getCurrentPosition()
      .then((geoPosition) => {
        const coordinates: Coordinates = {
          latitude: geoPosition.coords.latitude,
          longitude: geoPosition.coords.longitude,
        };
        this.createPlace(coordinates.latitude, coordinates.longitude);
        this.isLoading = false;
      })
      .catch((err) => {
        this.isLoading = false;
        this.showErrorAlert();
      });
  }

  private showErrorAlert() {
    this.alertCtrl
      .create({
        header: "Could not fetch your current location",
        message: "Please use the map to pick a location!",
        buttons: ['Okay']
      })
      .then((alertEl) => {
        alertEl.present();
      });
  }
  private openMap() {
    this.modalCtrl.create({ component: MapModalComponent }).then((modalEl) => {
      modalEl.onDidDismiss().then((modalData) => {
        if (!modalData.data) {
          return;
        }
        const coordinates: Coordinates = {
          latitude: modalData.data.lat,
          longitude: modalData.data.lng,
        };
        this.createPlace(coordinates.latitude, coordinates.longitude);
      });
      modalEl.present();
    });
  }

  private createPlace(lat: number, lng: number) {
    const pickedLocation: PlaceLocation = {
      latitude: lat,
      longitude: lng,
      address: null,
      staticMapImageUrl: null,
    };
    this.isLoading = true;
    this.getAddress(lat, lng)
      .pipe(
        switchMap((address) => {
          pickedLocation.address = address;
          return of(
            this.getMapImage(
              pickedLocation.latitude,
              pickedLocation.longitude,
              14
            )
          );
        })
      )
      .subscribe((staticMapImageUrl) => {
        pickedLocation.staticMapImageUrl = staticMapImageUrl;
        this.selectedLocationImage = staticMapImageUrl;
        this.isLoading = false;
        this.locationPick.emit(pickedLocation);
      });
  }

  private getAddress(latitude: number, longitude: number) {
    return this.http
      .get<any>(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${environment.googleMapsAPIKey}`
      )
      .pipe(
        map((geoData) => {
          console.log(geoData);
          if (!geoData || !geoData.results || geoData.results.length === 0) {
            return null;
          }
          return geoData.results[0].formatted_address;
        })
      );
  }

  private getMapImage(lat: number, lng: number, zoom: number) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat}, ${lng}&zoom=${zoom}&size=600x300&maptype=roadmap&markers=color:red%7Clabel:Place%7C${lat},${lng}
    &key=${environment.googleMapsAPIKey}`;
  }
}
