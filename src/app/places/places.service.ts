import { Injectable } from "@angular/core";
import { BehaviorSubject, of } from "rxjs";
import { AuthService } from "../auth/auth.service";
import { Place } from "./place.model";
import { take, filter, map, tap, switchMap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { PlaceLocation } from "./location.model";

interface PlaceData {
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
export class PlacesService {
  // tslint:disable-next-line: variable-name
  private _places = new BehaviorSubject<Place[]>([]);

  get places() {
    return this._places.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient) {}
  //   new Place(
  //     'p1',
  //     'Manhattan Mansion',
  //     'In the heart of New York City.',
  //     'https://lonelyplanetimages.imgix.net/mastheads/GettyImages-538096543_medium.jpg?sharp=10&vib=20&w=1200',
  //     149.99,
  //     new Date('2019-01-01'),
  //     new Date('2019-12-31'),
  //     'xyz'
  //   ),
  //   new Place(
  //     'p2',
  //     'L\'Amour Toujours',
  //     'A romantic place in Paris!',
  //     'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Paris_Night.jpg/1024px-Paris_Night.jpg',
  //     189.99,
  //     new Date('2019-01-01'),
  //     new Date('2019-12-31'),
  //     'mln'
  //   ),
  //   new Place(
  //     'p3',
  //     'The Foggy Palace',
  //     'Not your average city trip!',
  //     'https://upload.wikimedia.org/wikipedia/commons/0/01/San_Francisco_with_two_bridges_and_the_fog.jpg',
  //     99.99,
  //     new Date('2019-01-01'),
  //     new Date('2019-12-31'),
  //     'mln'
  //   ),
  // ]);

  fetchPlaces() {
    return this.authService.token.pipe(
      take(1),
      switchMap((token) => {
        return this.http.get<{ [id: string]: PlaceData }>(
          `https://bookingag-4ced5.firebaseio.com/offered-places.json?auth=${token}`
        );
      }),
      map((resData) => {
        const places = [];
        for (const id in resData) {
          if (resData.hasOwnProperty(id)) {
            places.push(
              new Place(
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
        return places;
        //  return [];
      }),
      tap((places) => {
        this._places.next(places); // making sure whatever subscribes get the latest places
      })
    );
  }

  // This getPlace is for inMemory data
  // getPlace(id: string) {
  //   return this.places.pipe(
  //     take(1),
  //     map((places) => {
  //       return { ...places.find((p) => p.id === id) };
  //     })
  //   );
  // }

  getPlace(id: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap((token) => {
        return this.http.get<PlaceData>(
          `https://bookingag-4ced5.firebaseio.com/offered-places/${id}.json?auth=${token}`
        );
      }),
      map((resData) => {
        return new Place(
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

  addPlace(
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
    let newPlace: Place;
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        fetchedUserId = userId;  
        return this.authService.token;
      }),
      take(1),
      switchMap((token) => {
        if (!fetchedUserId) {
          throw new Error("No user found!");
        }
        newPlace = new Place(
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
          { ...newPlace, id: null }
        );
      }),
      switchMap((resData) => {
        generatedId = resData.id;
        return this.places;
      }),
      take(1),
      tap((places) => {
        newPlace.id = generatedId;
        this._places.next(places.concat(newPlace));
      })
    );
    // return  this.http.post('https://bookingag-4ced5.firebaseio.com/offered-places.json', {...newPlace, id: null}).pipe(
    //    tap(resData => {
    //     console.log(resData);
    //    }));
    // this.places.pipe(take(1)).subscribe((places) => {
    //   this._places.next(places.concat(newPlace));
    // });
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    let fetchedToken: string;
    return this.authService.token.pipe(
      take(1), 
      switchMap(token => {
        fetchedToken = token;
        return this.places;
    }), take(1),
      switchMap((places) => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap((places) => {
        const updatedPlaceIndex = places.findIndex((pl) => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId,
          oldPlace.location
        );
        return this.http.put(
          `https://bookingag-4ced5.firebaseio.com/offered-places.json/${placeId}.json?auth=${fetchedToken}`,
          { ...updatedPlaces[updatedPlaceIndex], id: null }
        );
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    );
  }
}
