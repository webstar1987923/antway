import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { ExpoService } from '@shared';

@Component({
	selector: 'app-expo-view',
	template: `
		<nz-tabset
			[nzSelectedIndex]="selectedTab"
			(nzSelectedIndexChange)="selectTab($event)"
		>
			<nz-tab nzTitle="展会内容" [nzForceRender]="true">
				<app-expo-content
					*ngIf="selectedTab == 0 && load"
				></app-expo-content>
			</nz-tab>
			<nz-tab nzTitle="合作媒体" [nzForceRender]="true">
				<app-cooperative-image
					*ngIf="selectedTab == 1 && load"
				></app-cooperative-image>
			</nz-tab>
			<nz-tab nzTitle="展馆设置" [nzForceRender]="true">
				<app-hall-setting
					*ngIf="selectedTab == 2 && load"
				></app-hall-setting>
			</nz-tab>
			<nz-tab nzTitle="展会设置" [nzForceRender]="true">
				<app-expo-setting
					*ngIf="selectedTab == 3 && load"
				></app-expo-setting>
			</nz-tab>
			<nz-tab nzTitle="Banner设置">
				<app-expo-banner
					*ngIf="selectedTab == 4 && load"
				></app-expo-banner>
			</nz-tab>
			<nz-tab nzTitle="免费大巴设置">
				<app-bus-list *ngIf="selectedTab == 5 && load"></app-bus-list>
			</nz-tab>
			<nz-tab nzTitle="参观证设置">
				<app-expo-card *ngIf="selectedTab == 6 && load"></app-expo-card>
			</nz-tab>
		</nz-tabset>
	`,
})
export class ExpoViewComponent implements OnInit {
	data: any = {};
	load = false;
	selectedTab = 0;
	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private expoSrv: ExpoService,
	) {}

	ngOnInit() {
		this.expoSrv.setExpo({});
		this.selectedTab = this.data.selectedTab || 0;
		this.comSrv.getExpo(this.data.record.id).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.load = true;
				this.expoSrv.setExpo(res.data);
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	selectTab(idx: number) {
		this.selectedTab = idx;
	}
}
