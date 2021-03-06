import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Booking } from './booking.model';
import { BookingService } from './booking.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit , OnDestroy{
 form: FormGroup;
 loadedBookings: Booking[];
 bookingSub: Subscription;
 isLoading = false;

  constructor(private bookingService: BookingService, private loadingCtrl: LoadingController) {

   }

  ngOnInit() {
    this.bookingSub = this.bookingService.bookings.subscribe( bookings => { 
      this.loadedBookings = bookings;
    } );
  }

  ionViewWillEnter(){
    this.isLoading = true;
    this.bookingService.fetchBookings().subscribe(() => {
    this.isLoading = false;
    });
  }
  onCancelBooking(bookingId: string, slidingEl: IonItemSliding){
    slidingEl.close();
    this.loadingCtrl.create({
      message: 'Deleting the booking...'
    }).then( loadingEl => {
      loadingEl.present();
      this.bookingService.cancelBooking(bookingId).subscribe(() => {
        loadingEl.dismiss();
      });
    })
    
  }
  ngOnDestroy(){
    if (this.bookingSub){
      this.bookingSub.unsubscribe();
  }
}
}
