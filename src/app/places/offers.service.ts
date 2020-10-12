import { Injectable } from '@angular/core';
import { Offer } from './offer.model';

@Injectable({
  providedIn: 'root'
})
export class OffersService {
  private _offers: Offer[] = [
    new Offer(
      'o1',
      'Italian Castle',
      'In the heart of Tuscany.',
      'https://upload.wikimedia.org/wikipedia/commons/8/81/Casa_Portagioia_in_Tuscany.jpg',
      199.99
    ),
    new Offer(
      'o2',
      "El grand hotel",
      'A historic hotel in Santander',
      'https://upload.wikimedia.org/wikipedia/commons/9/98/Santander_-_buildings.jpg',
      179.99
    ),
    new Offer(
      'o3',
      'The Gentleman',
      'English adventure',
      'https://upload.wikimedia.org/wikipedia/commons/8/88/Palmse_manor_house_at_summer.jpg',
      180.99
    )
  
   ];
  
   get offers() {
     return [...this._offers];
   }
   constructor() { }
   getOffer(id: string){
     return {...this._offers.find(o => (o.id === id))};
     }
  
}
