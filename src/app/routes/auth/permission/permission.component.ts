import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
	selector: 'app-permission-layout',
	templateUrl: './permission.component.html',
})
export class PermissionComponent implements OnInit, OnDestroy {
	private router$: Subscription;
	tabs: any[] = [
		{
			key: 'binding',
			tab: '角色绑定权限',
		},
		{
			key: 'group',
			tab: '权限组管理',
		},
		{
			key: 'permission',
			tab: '节点管理',
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
		this.router.navigateByUrl(`/auth/permission/${item.key}`);
	}

	ngOnDestroy() {
		this.router$.unsubscribe();
	}
}
