import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SFDateWidgetSchema, SFSchema } from '@delon/form';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
	selector: 'app-bus-description',
	template: `
		<div class="modal-header mb-0">
			<div class="modal-title">
				{{ data.record.id ? '修改' : '新增' }}注意事项
			</div>
		</div>
		<nz-tabset [nzTabBarStyle]="{ 'margin-bottom': '0' }">
			<nz-tab
				*ngFor="let tab of descriptionTabs; let i = index"
				[nzTitle]="tab"
				[nzForceRender]="true"
			>
				<div>
					<app-wang-editor
						[(content)]="descriptions[i]"
					></app-wang-editor>
				</div>
			</nz-tab>
		</nz-tabset>
		<div class="modal-footer">
			<button nz-button type="button" (click)="close()">取 消</button>
			<button
				nz-button
				type="submit"
				[nzType]="'primary'"
				(click)="save()"
			>
				确 定
			</button>
		</div>
	`,
})
export class BusDescriptionComponent implements OnInit {
	loading = false;
	data: any = {};
	schema: SFSchema;

	selectedDescriptionTab = 0;
	descriptionTabs: string[] = ['注意事项-中文', '注意事项-英文'];
	descriptions: string[];

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.refreshDescription();
	}

	refreshDescription() {
		this.descriptions = [
			this.data.record.description.zh || '',
			this.data.record.description.en || '',
		];
	}

	save() {
		this.blkSrv.setBlockStatus(true);
		const postData = {
			id: this.data.record.id,
			expo_id: this.data.expo_id,
			description_zh: this.descriptions[0],
			description_en: this.descriptions[1],
		};
		this.comSrv.updateBus(postData).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.msgSrv.success('保存成功');
				this.modal.close(res);
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
				this.loading = false;
			},
		);
	}

	close() {
		this.modal.destroy();
	}
}
