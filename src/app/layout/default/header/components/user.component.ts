import {
	ChangeDetectionStrategy,
	Component,
	Inject,
	OnDestroy,
	OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { SettingsService } from '@delon/theme';
import { AuthenticationService } from '@shared';
import { Subscription } from 'rxjs';

@Component({
	selector: 'header-user',
	template: `
		<div
			class="alain-default__nav-item d-flex align-items-center px-sm"
			nz-dropdown
			nzPlacement="bottomRight"
			[nzDropdownMenu]="userMenu"
		>
			<nz-avatar
				nzSize="small"
				class="mr-sm"
				[nzSrc]="
					user?.profilePicture
						? user?.profilePicture
						: 'assets/img/user.svg'
				"
			></nz-avatar>
			{{ user ? user.user_name : 'Admin' }}
		</div>
		<nz-dropdown-menu #userMenu="nzDropdownMenu">
			<div nz-menu class="width-sm">
				<div nz-menu-item routerLink="/pro/account/center">
					<i nz-icon nzType="user" class="mr-sm"></i>
					{{ 'menu.account.center' | translate }}
				</div>
				<div nz-menu-item routerLink="/pro/account/settings">
					<i nz-icon nzType="setting" class="mr-sm"></i>
					{{ 'menu.account.settings' | translate }}
				</div>
				<div nz-menu-item routerLink="/exception/trigger">
					<i nz-icon nzType="close-circle" class="mr-sm"></i>
					{{ 'menu.account.trigger' | translate }}
				</div>
				<li nz-menu-divider></li>
				<div nz-menu-item (click)="logout()">
					<i nz-icon nzType="logout" class="mr-sm"></i>
					{{ 'menu.account.logout' | translate }}
				</div>
			</div>
		</nz-dropdown-menu>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderUserComponent implements OnInit, OnDestroy {
	public user: any;
	private userUpdatesSubscription: Subscription;

	constructor(
		private authenticationService: AuthenticationService,
		public settings: SettingsService,
		private router: Router,
	) {}

	ngOnInit() {
		this.userUpdatesSubscription = this.authenticationService
			.getUserUpdates()
			.subscribe((user) => {
				this.user = user;
			});
	}

	ngOnDestroy() {
		this.userUpdatesSubscription.unsubscribe();
	}

	logout() {
		this.authenticationService.logout();
		this.router.navigateByUrl(this.authenticationService.loginUrl);
	}
}
