import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
	selector: 'app-seller-layout',
	templateUrl: './seller.component.html',
})
export class SellerComponent implements OnInit, OnDestroy {
	private router$: Subscription;
	tabs: any[] = [
		{
			key: 'applicant',
			tab: '参展申请列表',
		},
		{
			key: 'hall',
			tab: '展位列表',
		},
	];

	pos = 0;

	constructor(private router: Router) {}

	private setActive() {
		const key = this.router.url.substr(
			this.router.url.lastIndexOf('/') + 1,
		);
		const idx = this.tabs.findIndex((w) => w.key === key);
		if (idx !== -1) {
			this.pos = idx;
		}
	}

	ngOnInit(): void {
		this.router$ = this.router.events
			.pipe(filter((e) => e instanceof ActivationEnd))
			.subscribe(() => this.setActive());
		this.setActive();
	}

	to(item: any) {
		this.router.navigateByUrl(`/seller/${item.key}`);
	}

	ngOnDestroy() {
		this.router$.unsubscribe();
	}
}
