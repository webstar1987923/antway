import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { ExpoService } from '@shared';

@Component({
	selector: 'app-expo-view',
	template: `
		<div class="modal-header mb-0">
			<div class="modal-title">历届展会详情</div>
		</div>
		<div style="margin-bottom: 1rem;">
			<nz-tabset>
				<nz-tab nzTitle="历届展会内容" [nzForceRender]="true">
					<app-expo-content></app-expo-content>
				</nz-tab>
				<nz-tab nzTitle="展会图片">
					<app-expo-picture></app-expo-picture>
				</nz-tab>
				<nz-tab nzTitle="展会视频">
					<app-expo-video></app-expo-video>
				</nz-tab>
			</nz-tabset>
		</div>
	`,
})
export class ExpoViewComponent implements OnInit {
	data: any = {};
	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private expoSrv: ExpoService,
	) {}

	ngOnInit() {
		this.expoSrv.setExpo({});
		this.comSrv.getExpo(this.data.record.id).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.expoSrv.setExpo(res.data);
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}
}
