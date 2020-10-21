import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { MapModalComponent } from '../../map-modal/map-modal.component';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {

  constructor(private modalCtrl: ModalController, private http: HttpClient) { }

  ngOnInit() {}

  onPickLocation(){
    this.modalCtrl.create({
      component: MapModalComponent}).then( modalEl => { 
        modalEl.onDidDismiss().then( modalData => {
          if(!modalData.data){
            return;
          }
          this.getAddress(modalData.data.latitude, modalData.data.longitude).subscribe(
              (address => {
                console.log(address);
              })
          );
          console.log(modalData.data);
        });
        modalEl.present();
      }
        );

        
  }
  private getAddress(latitude: number, longitude: number){
return this.http.
get<any>
(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${environment.googleMapsAPIKey}`)
.pipe(
  map( geoData  => {
    console.log(geoData);
    if(!geoData || !geoData.results || geoData.results.length ===0){
      return null;
    }
    return geoData.results[0].formatted_address;

}));
  }
}
