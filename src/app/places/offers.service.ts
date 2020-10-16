import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { AuthService } from "../auth/auth.service";
import { Offer } from "./offer.model";
import { take, filter, map, tap, delay } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class OffersService {
  // tslint:disable-next-line: variable-name
  private _offers = new BehaviorSubject<Offer[]>([
    new Offer(
      "o1",
      "Italian Castle",
      "In the heart of Tuscany.",
      "https://upload.wikimedia.org/wikipedia/commons/8/81/Casa_Portagioia_in_Tuscany.jpg",
      199.99,
      new Date("2019-01-01"),
      new Date("2019-12-31"),
      "abc"
    ),
    new Offer(
      "o2",
      "El grand hotel",
      "A historic hotel in Santander",
      "https://upload.wikimedia.org/wikipedia/commons/9/98/Santander_-_buildings.jpg",
      179.99,
      new Date("2019-01-01"),
      new Date("2019-12-31"),
      "abc"
    ),
    new Offer(
      "o3",
      "The Gentleman",
      "English adventure",
      "https://upload.wikimedia.org/wikipedia/commons/8/88/Palmse_manor_house_at_summer.jpg",
      180.99,
      new Date("2019-01-01"),
      new Date("2019-12-31"),
      "abc"
    ),
  ]);

  get offers() {
    return this._offers.asObservable();
  }
  constructor(private authService: AuthService) {}

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
    const newOffer = new Offer(
      Math.random().toString(),
      title,
      description,
      "https://upload.wikimedia.org/wikipedia/commons/6/69/CampanileGiotto-01.jpg",
      price,
      dateFrom,
      dateTo,
      this.authService.userId
    );
    return this.offers.pipe(
      take(1),
      delay(1000),
      tap((offers) => {
        this._offers.next(offers.concat(newOffer)); // we are adding the delay to mimic behaviour when the fetching takes a little longer
      })
    );
  }
}
