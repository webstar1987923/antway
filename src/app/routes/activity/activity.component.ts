import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
	selector: 'app-activity-layout',
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
export class ActivityComponent implements OnInit, OnDestroy {
	private router$: Subscription;
	tabs: any[] = [
		{
			key: 'all',
			tab: '全部',
		},
		{
			key: 'pending',
			tab: '未开始',
		},
		{
			key: 'processing',
			tab: '进行中',
		},
		{
			key: 'closed',
			tab: '已结束',
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
		this.router.navigateByUrl(`/activity/${item.key}`);
	}

	ngOnDestroy() {
		this.router$.unsubscribe();
	}
}
