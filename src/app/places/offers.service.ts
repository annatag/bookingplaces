import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Offer } from './offer.model';
import { take, filter, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';


interface OfferData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}
@Injectable({
  providedIn: 'root',
})
export class OffersService {
  // tslint:disable-next-line: variable-name
  private _offers = new BehaviorSubject<Offer[]>([]);
  //   new Offer(
  //     'o1',
  //     'Italian Castle',
  //     'In the heart of Tuscany.',
  //     'https://upload.wikimedia.org/wikipedia/commons/8/81/Casa_Portagioia_in_Tuscany.jpg',
  //     199.99,
  //     new Date('2019-01-01'),
  //     new Date('2019-12-31'),
  //     'abc'
  //   ),
  //   new Offer(
  //     'o2',
  //     'El grand hotel',
  //     'A historic hotel in Santander',
  //     'https://upload.wikimedia.org/wikipedia/commons/9/98/Santander_-_buildings.jpg',
  //     179.99,
  //     new Date('2019-01-01'),
  //     new Date('2019-12-31'),
  //     'abc'
  //   ),
  //   new Offer(
  //     'o3',
  //     'The Gentleman',
  //     'English adventure',
  //     'https://upload.wikimedia.org/wikipedia/commons/8/88/Palmse_manor_house_at_summer.jpg',
  //     180.99,
  //     new Date('2019-01-01'),
  //     new Date('2019-12-31'),
  //     'abc'
  //   ),
  // ]);


  get offers() {
    return this._offers.asObservable();
  }
  constructor(
    private authService: AuthService, private http: HttpClient
    ) {}

//   fetchOffers(){
// return this.http.get('https://bookingag-4ced5.firebaseio.com/').pipe(
//   tap(resData => {
//     console.log(resData);
//   }));
// }

fetchOffers(){
  return this.http
  .get<{ [id: string]: OfferData}>('https://bookingag-4ced5.firebaseio.com/offered-places.json')
  .pipe(
      map(resData => {
      const offers = [];
      for (const id in resData) {
        if (resData.hasOwnProperty(id)) {
          offers.push(
            new Offer(
            id,
            resData[id].title,
            resData[id].description,
            resData[id].imageUrl,
            resData[id].price,
            new Date(resData[id].availableFrom),
            new Date(resData[id].availableTo),
            resData[id].userId
               )
             );
            }
          }
      return offers;
    //  return [];
  }), tap(offers => {
    this._offers.next(offers); //making sure whatever subscribes get the latest places
  })
  );
}

getOffer(id: string) {
    return this.offers.pipe(
      take(1),
      map((offers) => {
        return { ...offers.find((o) => o.id === id) };
      })
    );
  }

addOffer(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string;
    const newOffer = new Offer(
      Math.random().toString(),
      title,
      description,
      'https://upload.wikimedia.org/wikipedia/commons/6/69/CampanileGiotto-01.jpg',
      price,
      dateFrom,
      dateTo,
      this.authService.userId
    );


    return  this.http.post<{id: string}>('https://bookingag-4ced5.firebaseio.com/offered-places.json', {...newOffer, id: null}).pipe(
      switchMap(resData => {
        generatedId = resData.id;
        return this.offers;
      }),
      take(1),
      tap(offers => {
        newOffer.id = generatedId;
        this._offers.next(offers.concat(newOffer));
      })
      );
    // return  this.http.post<{name: string}>('https://bookingag-4ced5.firebaseio.com/offered-places.json', {...newOffer, id: null}).pipe(
    //   tap(resData => {
    //    console.log(resData);
    //   }));
    // return this.offers.pipe(
    //   take(1),
    //   delay(1000),
    //   tap((offers) => {
    //     this._offers.next(offers.concat(newOffer)); // we are adding the delay to mimic behaviour when the fetching takes a little longer
    //   })
    // );
  }
//This is for in memory db
// updateOffer(offerId: string, title: string, description: string, price: number){
//     return this.offers.pipe(
//       take(1),
//       delay(1000),
//       tap(offers => {
//       const updatedOfferIndex = offers.findIndex(of => of.id === offerId);
//       const updatedOffers = [...offers];
//       const oldOffer = updatedOffers[updatedOfferIndex];
//       updatedOffers[updatedOfferIndex] = new Offer(
//         oldOffer.id,
//         title, description,
//         oldOffer.imageUrl,
//         price,
//         oldOffer.availableFrom,
//         oldOffer.availableTo,
//         oldOffer.userId
//         );
//       this._offers.next(updatedOffers); // emititn the updated list
//     })
//     );
//   }

updateOffer(offerId: string, title: string, description: string, price: number){
  let updatedOffers: Offer[];
  return  this.offers.pipe(
    take(1), switchMap(offers => {  // fetching my current list of offers
    const updatedOfferIndex = offers.findIndex(of => of.id === offerId);
    updatedOffers = [...offers];
    const oldOffer = updatedOffers[updatedOfferIndex];
    updatedOffers[updatedOfferIndex] = new Offer(
      oldOffer.id,
      title, description,
      oldOffer.imageUrl,
      price,
      oldOffer.availableFrom,
      oldOffer.availableTo,
      oldOffer.userId
      );
      return  this.http.put(`https://bookingag-4ced5.firebaseio.com/offered-places/${offerId}.json`, 
      {...updatedOffers[updatedOfferIndex] , id: null}
      );      
    }), tap(() => {
      this._offers.next(updatedOffers); // emititn the updated list
    }));
}
}
