import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit , AfterViewInit , OnDestroy{
   @ViewChild('map') mapElementRef: ElementRef;
   @Input() center = {lat: -34.397, lng: 150.644}; //@Input makes this property findable from outside
   @Input() selectable = true;
   @Input() closeButtonText = 'Cancel';
   @Input() title = 'Pick Location';
   clickListener: any;
   googleMaps: any; 
   constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private router: Router,
    private renderer: Renderer2) { }

  ngOnInit() {}

  ngAfterViewInit(){

    this.getGoogleMaps().then(googleMaps => {
      this.googleMaps = googleMaps;
      const mapEl = this.mapElementRef.nativeElement;
      const map =  new googleMaps.Map(mapEl, {
        center: this.center,
        zoom: 16
      });
      googleMaps.event.addListenerOnce(map, 'idle', () => {
        this.renderer.addClass(mapEl, 'visible');
      });
      if(this.selectable){
        this.clickListener = map.addListener('click', event => {
          const selectedCoords = { 
            latitude: event.latLng.lat(), 
            longitude: event.latLng.lng()
          };
          this.modalCtrl.dismiss(selectedCoords);
        });
      } else{
        const marker = new googleMaps.Marker({
          position: this.center,
          map: map,
          title: 'Picked Location'
        });
        marker.setMap(map);
      }
      
    }).catch (err => {
     console.log(err); });
  //   this.getGoogleMaps().then().catch (err => {
  //   console.log(err);
  //   this.alertCtrl.create({
  //     header: 'An error occured!',
  //     message: 'Google map could not load!',
  //     buttons: [{
  //       text: 'Okay',
  //     handler: () => {
  //       this.router.navigate(['places/tabs/offers/new-offer']);
  //     }}]
  //   }).then(alertEl => {
  //     alertEl.present();
  //   })
  // });
  // };
}

  onCancel(){
  this.modalCtrl.dismiss();
  }


  ngOnDestroy(){
    if(this.clickListener){
    this.googleMaps.event.removeListener(this.clickListener);}
  }
  private getGoogleMaps(): Promise<any>{
    const win = window as any;
    const googleModule = win.google;
    if (googleModule && googleModule.maps){
      return Promise.resolve(googleModule.maps);
    }
    return new Promise((resolve, reject) => {
     const script = document.createElement('script');
     script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsAPIKey}`;
     script.async = true;
     script.defer = true;
     document.body.appendChild(script);
     script.onload = () => {
       const loadedGoogleModule = win.google;
       if (loadedGoogleModule && loadedGoogleModule.maps){
         resolve (loadedGoogleModule.maps);
       } else {
         reject ('Google maps SDK not available. ');
       }
     };
   });
  }

}
