import { DOCUMENT } from '@angular/common';
import {
	AfterViewInit,
	Component,
	ComponentFactoryResolver,
	ElementRef,
	Inject,
	OnDestroy,
	OnInit,
	Renderer2,
	ViewChild,
	ViewContainerRef,
} from '@angular/core';
import {
	NavigationCancel,
	NavigationEnd,
	NavigationError,
	RouteConfigLoadEnd,
	RouteConfigLoadStart,
	Router,
} from '@angular/router';
import { SettingsService } from '@delon/theme';
import { updateHostClass } from '@delon/util';
import { environment } from '@env/environment';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SettingDrawerComponent } from './setting-drawer/setting-drawer.component';

@Component({
	selector: 'layout-default',
	templateUrl: './default.component.html',
})
export class LayoutDefaultComponent
	implements OnInit, AfterViewInit, OnDestroy {
	private unsubscribe$ = new Subject<void>();
	// @ViewChild('settingHost', { read: ViewContainerRef, static: true })
	// private settingHost: ViewContainerRef;
	@BlockUI() blockUI: NgBlockUI;
	isFetching = false;
	isCollapsed = false;
	private blockingSubscription: Subscription;

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		router: Router,
		msgSrv: NzMessageService,
		private resolver: ComponentFactoryResolver,
		private settings: SettingsService,
		private el: ElementRef,
		private renderer: Renderer2,
		@Inject(DOCUMENT) private doc: any,
	) {
		// scroll to top in change page
		router.events.pipe(takeUntil(this.unsubscribe$)).subscribe((evt) => {
			if (!this.isFetching && evt instanceof RouteConfigLoadStart) {
				this.isFetching = true;
			}
			if (
				evt instanceof NavigationError ||
				evt instanceof NavigationCancel
			) {
				this.isFetching = false;
				if (evt instanceof NavigationError) {
					msgSrv.error(`无法加载${evt.url}路由`, {
						nzDuration: 1000 * 3,
					});
				}
				return;
			}
			if (
				!(
					evt instanceof NavigationEnd ||
					evt instanceof RouteConfigLoadEnd
				)
			) {
				return;
			}
			if (this.isFetching) {
				setTimeout(() => {
					this.isFetching = false;
				}, 100);
			}
		});
	}

	private setClass() {
		const { el, doc, renderer, settings } = this;
		const layout = settings.layout;
		this.isCollapsed = layout.collapsed;
		updateHostClass(el.nativeElement, renderer, {
			['alain-default']: true,
			[`alain-default__fixed`]: layout.fixed,
			[`alain-default__collapsed`]: layout.collapsed,
		});

		doc.body.classList[layout.colorWeak ? 'add' : 'remove']('color-weak');
	}

	ngAfterViewInit(): void {
		// Setting componet for only developer
		if (!environment.production) {
			setTimeout(() => {
				const settingFactory = this.resolver.resolveComponentFactory(
					SettingDrawerComponent,
				);
				// this.settingHost.createComponent(settingFactory);
			}, 22);
		}
	}

	ngOnInit() {
		const { settings, unsubscribe$ } = this;
		settings.notify
			.pipe(takeUntil(unsubscribe$))
			.subscribe(() => this.setClass());
		this.setClass();
		this.getBlockStatus();
	}

	ngOnDestroy() {
		const { unsubscribe$ } = this;
		unsubscribe$.next();
		unsubscribe$.complete();
		this.blockingSubscription.unsubscribe();
	}

	getBlockStatus() {
		this.blockingSubscription = this.blkSrv
			.getBlockStatus()
			.subscribe((status) => {
				if (status) {
					this.blockUI.start();
				} else {
					this.blockUI.stop();
				}
			});
	}
}
