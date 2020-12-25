import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {
	SFComponent,
	SFRadioWidgetSchema,
	SFSchema,
	SFSelectWidgetSchema,
} from '@delon/form';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import * as _ from 'underscore';

@Component({
	selector: 'app-email-template-modal',
	templateUrl: './email-template-modal.component.html',
})
export class EmailTemplateModalComponent implements OnInit {
	data: any = {};
	@ViewChild('sf', { static: false }) sf: SFComponent;
	schema: SFSchema;
	contentTabs: string[] = ['中文', '英文'];
	bodies: string[] = [];

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.schema = {
			properties: {
				name: {
					type: 'string',
					title: '名称',
					default: this.data.record.name || '',
				},
				description: {
					type: 'string',
					title: '说明',
					default: this.data.record.description || '',
				},
				sms_template: {
					type: 'string',
					title: '国内短信模板ID',
					ui: {
						grid: {
							span: 12,
						},
					},
					default: this.data.record.sms_template || '',
				},
				sms_template_en: {
					type: 'string',
					title: '国际短信模板ID',
					ui: {
						grid: {
							span: 12,
						},
					},
					default: this.data.record.sms_template_en || '',
				},
			},
			required: ['name', 'description'],
			ui: {
				spanLabelFixed: 120,
				grid: {
					span: 24,
				},
				size: 'small',
			},
		};
		this.bodies = [
			this.data.record.body_zh || '',
			this.data.record.body_en || '',
		];
	}

	save(value: any) {
		const postData: any = {
			...value,
			id: this.data.record.id,
			subject_zh: this.data.record.subject_zh,
			subject_en: this.data.record.subject_en,
			body_zh: this.data.record.body_zh,
			body_en: this.data.record.body_en,
		};
		this.blkSrv.setBlockStatus(true);
		this.comSrv.updateEmailTemplate(postData).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.msgSrv.success(res.data.msg);
				this.modal.close(value);
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	close() {
		this.modal.destroy();
	}
}
