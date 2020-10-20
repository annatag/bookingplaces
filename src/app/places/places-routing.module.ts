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
            loadChildren: () => import('./search/place-detail/place-detail.module').then(m => m.PlaceDetailPageModule),
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
            path: 'new-offer',
            loadChildren: () => import('./offers/new-offer/new-offer.module').then(m => m.NewOfferPageModule)
          },
          {
            path: 'edit-offer/:offerId',
            loadChildren: () => import('./offers/edit-offer/edit-offer.module').then(m => m.EditOfferPageModule)
          },
          {
            path: ':offerId',
            loadChildren: () => import('./offers/offer-detail/offer-detail.module').then(m => m.OfferDetailPageModule)
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
