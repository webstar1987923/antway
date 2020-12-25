import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
	selector: 'app-recommend-layout',
	templateUrl: './recommend.component.html',
})
export class RecommendComponent implements OnInit, OnDestroy {
	private router$: Subscription;
	tabs: any[] = [
		{
			key: 'seller',
			tab: '推荐展商',
		},
		{
			key: 'company',
			tab: '推荐企业',
		},
		{
			key: 'product',
			tab: '推荐产品',
		},
		{
			key: 'writer',
			tab: '推荐专栏',
		},
		{
			key: 'article',
			tab: '推荐头条',
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
		this.router.navigateByUrl(`/recommend/${item.key}`);
	}

	ngOnDestroy() {
		this.router$.unsubscribe();
	}
}
