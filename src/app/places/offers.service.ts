import { Injectable } from "@angular/core";
import { BehaviorSubject, of } from "rxjs";
import { AuthService } from "../auth/auth.service";
import { Offer } from "./offer.model";
import { take, filter, map, tap, delay, switchMap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { PlaceLocation } from "./location.model";

interface OfferData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location: PlaceLocation;
}
@Injectable({
  providedIn: "root",
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
  constructor(private authService: AuthService, private http: HttpClient) {}

  //   fetchOffers(){
  // return this.http.get('https://bookingag-4ced5.firebaseio.com/').pipe(
  //   tap(resData => {
  //     console.log(resData);
  //   }));
  // }

  fetchOffers() {
    return this.authService.token.pipe(
      take(1),
      switchMap((token) => {
        return this.http.get<{ [id: string]: OfferData }>(
          `https://bookingag-4ced5.firebaseio.com/offered-places.json?auth=${token}`
        );
      }),
      map((resData) => {
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
                resData[id].userId,
                resData[id].location
              )
            );
          }
        }
        return offers;
        //  return [];
      }),
      tap((offers) => {
        this._offers.next(offers); // making sure whatever subscribes get the latest places
      })
    );
  }

  // getOffer(id: string) {
  //     return this.offers.pipe(
  //       take(1),
  //       map((offers) => {
  //         return { ...offers.find((o) => o.id === id) };
  //       })
  //     );
  //   }

  getOffer(id: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap((token) => {
        return this.http.get<OfferData>(
          `https://bookingag-4ced5.firebaseio.com/offered-places/${id}.json?auth=${token}`
        );
      }),
      map((resData) => {
        return new Offer(
          id,
          resData.title,
          resData.description,
          resData.imageUrl,
          resData.price,
          new Date(resData.availableFrom),
          new Date(resData.availableTo),
          resData.userId,
          resData.location
        );
      })
    );
  }

  uploadImage(image: File) {
    const uploadData = new FormData();
    uploadData.append("image", image);

    return this.authService.token.pipe(
      take(1),
      switchMap((token) => {
        return this.http.post<{ imageUrl: string; imagePath: string }>(
          `https://us-central1-bookingag-4ced5.cloudfunctions.net/storeImage`,
          uploadData,
          { headers: { Authorization: "Bearer" + token } }
        );
      })
    );
  }

  addOffer(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date,
    location: PlaceLocation,
    imageUrl: string
  ) {
    let generatedId: string;
    let fetchedUserId: string;
    let newOffer: Offer;
    return this.authService.userId.pipe(
      take(1),
      switchMap((userId) => {
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap((token) => {
        if (!fetchedUserId) {
          throw new Error("No user found!");
        }
        newOffer = new Offer(
          Math.random().toString(),
          title,
          description,
          imageUrl,
          price,
          dateFrom,
          dateTo,
          fetchedUserId,
          location
        );

        return this.http.post<{ id: string }>(
          `https://bookingag-4ced5.firebaseio.com/offered-places.json?auth=${token}`,
          { ...newOffer, id: null }
        );
      }),
      switchMap((resData) => {
        generatedId = resData.id;
        return this.offers;
      }),
      take(1),
      tap((offers) => {
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
  // This is for in memory db
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

  updateOffer(
    offerId: string,
    title: string,
    description: string,
    price: number
  ) {
    let updatedOffers: Offer[];
    let fetchedToken: string;
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.offers;
      }), 
      take(1),
      switchMap((offers) => {
        if (!offers || offers.length <= 0) {
          return this.fetchOffers();
        } else {
          return of(offers);
        } // fetching my current list of offers
      }),
      switchMap((offers) => {
        // tslint:disable-next-line: no-shadowed-variable
        const updatedOfferIndex = offers.findIndex((of) => of.id === offerId);
        updatedOffers = [...offers];
        const oldOffer = updatedOffers[updatedOfferIndex];
        updatedOffers[updatedOfferIndex] = new Offer(
          oldOffer.id,
          title,
          description,
          oldOffer.imageUrl,
          price,
          oldOffer.availableFrom,
          oldOffer.availableTo,
          oldOffer.userId,
          oldOffer.location
        );
        return this.http.put(
          `https://bookingag-4ced5.firebaseio.com/offered-places/${offerId}.json?auth=${fetchedToken}`,
          { ...updatedOffers[updatedOfferIndex], id: null }
        );
      }),
      tap(() => {
        this._offers.next(updatedOffers); // emititn the updated list
      })
    );
  }
}
