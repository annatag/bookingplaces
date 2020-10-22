import { HttpClient } from "@angular/common/http";
import { Component, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { of } from 'rxjs';
import { map, switchMap } from "rxjs/operators";
import { PlaceLocation } from "src/app/places/location.model";
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
  constructor(private modalCtrl: ModalController, private http: HttpClient) {}

  ngOnInit() {}

  onPickLocation() {
    this.modalCtrl
      .create({
        component: MapModalComponent,
      })
      .then((modalEl) => {
        modalEl.onDidDismiss().then((modalData) => {
          if (!modalData.data) {
            return;
          }
          const pickedLocation: PlaceLocation = {
            latitude: modalData.data.latitude,
            longitude: modalData.data.longitude,
            address: null,
            staticMapImageUrl: null,
          };
          this.isLoading = true;
          this.getAddress(
            modalData.data.latitude,
            modalData.data.longitude
          ).pipe(
            switchMap((address) => {
              pickedLocation.address = address;
              // pickedLocation.staticMapImageUrl
              return of(this.getMapImage(pickedLocation.latitude, pickedLocation.longitude, 14));
            })
          ).subscribe(staticMapImageUrl => {
            pickedLocation.staticMapImageUrl = staticMapImageUrl;
            this.selectedLocationImage = staticMapImageUrl;
            this.isLoading = false;
            this.locationPick.emit(pickedLocation);
          });
          console.log(modalData.data);
        });
        modalEl.present();
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

  private getMapImage(lat: number, lng: number, zoom: number){
    return  `https://maps.googleapis.com/maps/api/staticmap?center=${lat}, ${lng}&zoom=${zoom}&size=600x300&maptype=roadmap&markers=color:red%7Clabel:Place%7C${lat},${lng}
    &key=${environment.googleMapsAPIKey}`;
  }
}
