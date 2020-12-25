import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
	selector: 'app-seller-manage-layout',
	template: `
		<div class="page-header">
			<nz-tabset [nzSelectedIndex]="pos">
				<nz-tab
					*ngFor="let i of tabs"
					[nzTitle]="i.tab"
					(nzClick)="to(i)"
				></nz-tab>
			</nz-tabset>
		</div>
		<router-outlet></router-outlet>
	`,
})
export class SellerManageComponent implements OnInit, OnDestroy {
	private router$: Subscription;
	tabs: any[] = [
		{
			key: 'badge',
			tab: '证件申请',
		},
		{
			key: 'device',
			tab: '展具租赁',
		},
		{
			key: 'water',
			tab: '水电申请',
		},
		{
			key: 'lintel',
			tab: '楣板申请',
		},
		{
			key: 'ads',
			tab: '广告申请',
		},
		{
			key: 'proceed',
			tab: '会刊信息',
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
		this.router.navigateByUrl(`/seller-manage/${item.key}`);
	}

	ngOnDestroy() {
		this.router$.unsubscribe();
	}
}
