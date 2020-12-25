import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
	selector: 'app-writer-layout',
	template: `
		<div class="page-header p-0"></div>
		<router-outlet></router-outlet>
	`,
})
export class WriterComponent implements OnInit, OnDestroy {
	private router$: Subscription;
	tabs: any[] = [
		{
			key: 'all',
			tab: '所有用户',
		},
		{
			key: 'verified',
			tab: '认证会员',
		},
		{
			key: 'vip',
			tab: 'VIP会员',
		},
		{
			key: 'deleted',
			tab: '删除会员',
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
		this.router.navigateByUrl(`/user/${item.key}`);
	}

	ngOnDestroy() {
		this.router$.unsubscribe();
	}
}
