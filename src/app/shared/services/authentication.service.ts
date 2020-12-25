import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as jwtDecode from 'jwt-decode';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class AuthenticationService {
	public loginUrl = '/passport/login';
	// private token: string = null;
	private userSubject: BehaviorSubject<any>;

	constructor(private router: Router) {
		let user: any = null;
		try {
			user = localStorage.getItem('antwayA')
				? jwtDecode(localStorage.getItem('antwayA')).user
				: null;
		} catch {
			console.log('error');
		}
		this.userSubject = new BehaviorSubject<any>(user);
	}

	getToken() {
		return this.userSubject.getValue()?.token;
	}

	setUser(data: any) {
		localStorage.setItem('antwayA', JSON.stringify(data.user));
		this.userSubject.next(jwtDecode(localStorage.getItem('antwayA')).user);
	}

	getUser() {
		return this.userSubject.getValue();
	}

	getUserUpdates() {
		return this.userSubject.asObservable();
	}

	isAuthenticated() {
		return this.userSubject.getValue()?.token != null;
	}

	logout() {
		this.userSubject.next(null);
		this.clearLocalStorage();
		this.router.navigateByUrl('/login');
	}

	clearLocalStorage() {
		localStorage.removeItem('antwayA');
	}
}
