import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	CanActivate,
	CanActivateChild,
	CanLoad,
	Route,
	Router,
	RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';

@Injectable({
	providedIn: 'root',
})
export class UserGuard implements CanLoad, CanActivate, CanActivateChild {
	constructor(
		private router: Router,
		private authenticationService: AuthenticationService,
	) {}

	canLoad(route: Route): boolean | Observable<boolean> | Promise<boolean> {
		if (!this.authenticationService.isAuthenticated()) {
			this.router.navigateByUrl(this.authenticationService.loginUrl);
			return false;
		}
		return true;
	}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): boolean | Observable<boolean> | Promise<boolean> {
		if (!this.authenticationService.isAuthenticated()) {
			this.router.navigate([this.authenticationService.loginUrl], {
				queryParams: {
					returnUrl: state.url,
				},
			});
			return false;
		}
		return true;
	}

	canActivateChild(
		childRoute: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): boolean | Observable<boolean> | Promise<boolean> {
		if (!this.authenticationService.isAuthenticated()) {
			this.router.navigateByUrl(this.authenticationService.loginUrl);
			return false;
		}
		return true;
	}
}
