import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlacesPage } from './places.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: PlacesPage,
    children: [
      {
        path: 'search',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./search/search.module').then((m) => m.SearchPageModule),
          },
          {
            path: ':placeId',
            loadChildren:
              './search/place-detail/place-detail.module#PlaceDetailPageModule',
          },
        ],
      },

      {
        path: 'offers',
        children: [
          {
            path: '',
            loadChildren: () => import('./offers/offers.module').then((m) => m.OffersPageModule),
          },
          {
            path: 'new',
            loadChildren: './offers/new-offer/new-offer.module#NewOfferPageModule'
          },
          {
            path: ':offerId',
            loadChildren: './offers/offer-detail/offer-detail.module#OfferDetailPageModule'
          },
          {
            path: 'edit/:offerId',
            loadChildren: './offers/edit-offer/edit-offer.module#EditOfferPageModule'
          },
          {
            path: ':offerId',
            loadChildren: './offers/offer-bookings/offer-bookings.module#OfferBookingsPageModule'
          }
        ] 
      },
      {
        path: '',
        redirectTo: '/places/tabs/search',
        pathMatch: 'full'

      }
    ],
  },
  {
    path: '',
    redirectTo: '/places/tabs/search',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlacesPageRoutingModule {}
