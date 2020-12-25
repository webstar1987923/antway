import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
	selector: 'app-writer-layout',
	template: `
		<div class="page-header p-0"></div>
		<nz-card [nzBordered]="false">
			<nz-tabset nzTabPosition="left" [nzSelectedIndex]="pos">
				<nz-tab
					*ngFor="let i of tabs"
					[nzTitle]="i.tab"
					(nzClick)="to(i)"
				>
					<router-outlet></router-outlet>
				</nz-tab>
			</nz-tabset>
		</nz-card>
	`,
})
export class SettingComponent implements OnInit, OnDestroy {
	private router$: Subscription;
	tabs: any[] = [
		{
			key: 'email',
			tab: '信息模板',
		},
		{
			key: 'system',
			tab: '系统参数',
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
		this.router.navigateByUrl(`/setting/${item.key}`);
	}

	ngOnDestroy() {
		this.router$.unsubscribe();
	}
}
