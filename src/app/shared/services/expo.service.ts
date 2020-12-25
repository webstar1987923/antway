import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ExpoService {
	private expoSubject: BehaviorSubject<any> = new BehaviorSubject({});

	constructor() {}

	setExpo(data) {
		this.expoSubject.next(data);
	}

	getExpo() {
		return this.expoSubject.getValue();
	}

	getExpoUpdates() {
		return this.expoSubject.asObservable();
	}
}
