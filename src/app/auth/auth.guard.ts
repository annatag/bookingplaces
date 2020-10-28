import { ThrowStmt } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanLoad, Route, UrlSegment, Router } from '@angular/router';
import { timeStamp } from 'console';
import { Observable, of } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {

  constructor(private authService: AuthService, private router: Router){}
  canLoad(
    route: Route,
    segments: UrlSegment[]):
     Observable<boolean> | Promise<boolean> |  boolean {
       return this.authService.userIsAuthenticated.pipe(
         take(1), 
         switchMap(isAuthenticated => {
         if(!isAuthenticated) {
          return this.authService.autoLogin();
         } else{
           return of(isAuthenticated);
         }
        }),
        tap(isAuthenticated => {
          if(!isAuthenticated){
            this.router.navigateByUrl('/auth');
          }
        })
        );
  }
}
