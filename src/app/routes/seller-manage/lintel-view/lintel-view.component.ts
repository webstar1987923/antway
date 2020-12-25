import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { SFComponent, SFSchema, SFSelectWidgetSchema } from '@delon/form';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-lintel-view',
	templateUrl: './lintel-view.component.html',
})
export class LintelViewComponent implements OnInit, OnDestroy {
	loading = false;
	data: any = {};
	status: any[] = [];

	@ViewChild('sf', { static: false }) sf: SFComponent;
	schema: SFSchema;

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
		private sanitizer: DomSanitizer,
	) {}

	ngOnInit() {
		this.status = this.comSrv.expoLintelStatus;

		this.schema = {
			size: 'small',
			properties: {
				description_zh: {
					type: 'string',
					title: '说明',
					ui: {
						optional: '中文',
					},
					default: this.data.record.description.zh,
				},
				description_en: {
					type: 'string',
					title: '说明',
					ui: {
						optional: '英文',
					},
					default: this.data.record.description.en,
				},
				quantity: {
					type: 'number',
					title: '数量',
					default: this.data.record.quantity,
				},
				status: {
					type: 'string',
					title: '处理状态',
					enum: this.status,
					ui: {
						widget: 'select',
					} as SFSelectWidgetSchema,
					default: this.data.record.status,
				},
			},
			required: [
				'description_zh',
				'description_en',
				'quantity',
				'status',
			],
			ui: {
				spanLabelFixed: 100,
				grid: {
					span: 24,
				},
				size: 'small',
			},
		};
	}

	ngOnDestroy() {}

	save(value) {
		this.blkSrv.setBlockStatus(true);
		value.id = this.data.record.id;
		this.comSrv.updateExpoLintel(value).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.msgSrv.success(res.data.msg);
				this.modal.close(res);
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	close() {
		this.modal.destroy('Ok');
	}
}
