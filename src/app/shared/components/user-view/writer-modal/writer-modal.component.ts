import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { SFComponent, SFSchema, SFTransferWidgetSchema } from '@delon/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { TransferSearchChange } from 'ng-zorro-antd/transfer';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import * as _ from 'underscore';

import { BlockUIService } from '../../../services/block-ui.service';
import { CommonService } from '../../../services/common.service';

@Component({
	selector: 'app-writer-modal',
	templateUrl: './writer-modal.component.html',
})
export class WriterModalComponent implements OnInit {
	loading = false;
	@Input() user_id;
	record: any;
	writerStatus: any[] = [];
	@ViewChild('sf', { static: false }) sf: SFComponent;
	schema: SFSchema;

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.writerStatus = this.comSrv.writerStatus;
		this.refreshSchema();
		this.getData();
	}

	refreshSchema() {
		this.schema = {
			size: 'small',
			properties: {
				name_zh: {
					type: 'string',
					title: '专栏名称',
					ui: {
						optional: '中文',
						grid: {
							span: 17,
						},
					},
					default: this.record?.name?.zh || '',
				},
				name_en: {
					type: 'string',
					title: '专栏名称',
					ui: {
						optional: '英文',
						grid: {
							span: 17,
						},
					},
					default: this.record?.name?.en || '',
				},
				summary_zh: {
					type: 'string',
					title: '简介',
					ui: {
						optional: '中文',
						widget: 'textarea',
						autosize: { minRows: 2, maxRows: 6 },
						grid: {
							span: 24,
						},
					},
					default: this.record?.summary?.zh || '',
				},
				summary_en: {
					type: 'string',
					title: '简介',
					ui: {
						optional: '英文',
						widget: 'textarea',
						autosize: { minRows: 2, maxRows: 6 },
						grid: {
							span: 24,
						},
					},
					default: this.record?.summary?.en || '',
				},
				position: {
					type: 'string',
					title: '职业',
					ui: {
						grid: {
							span: 24,
						},
					},
					default: this.record?.position || '',
				},
				status: {
					type: 'string',
					title: '作者认证',
					ui: {
						widget: 'custom',
						grid: {
							span: 24,
						},
					},
				},
			},
			required: [
				'name_zh',
				'name_en',
				'summary_zh',
				'summary_en',
				'position',
			],
			ui: {
				spanLabelFixed: 140,
				grid: {
					span: 8,
				},
				size: 'small',
			},
		};
	}

	getData() {
		if (this.user_id) {
			this.blkSrv.setBlockStatus(true);
			this.comSrv.getWriter(this.user_id).subscribe(
				(res: any) => {
					this.blkSrv.setBlockStatus(false);
					this.record = res.data;
					this.refreshSchema();
				},
				(err: HttpErrorResponse) => {
					this.blkSrv.setBlockStatus(false);
				},
			);
		}
	}

	save(value: any) {
		this.blkSrv.setBlockStatus(true);
		if (this.record?.id) {
			this.comSrv
				.updateWriter({
					id: this.record.id,
					...value,
				})
				.subscribe(
					(res: any) => {
						this.blkSrv.setBlockStatus(false);
						this.msgSrv.success(res.data.msg);
					},
					(err: HttpErrorResponse) => {
						this.blkSrv.setBlockStatus(false);
					},
				);
		} else {
			this.comSrv
				.createWriter({
					id: this.user_id, // writer.id == user.id
					...value,
				})
				.subscribe(
					(res: any) => {
						this.blkSrv.setBlockStatus(false);
						this.msgSrv.success(res.data.msg);
					},
					(err: HttpErrorResponse) => {
						this.blkSrv.setBlockStatus(false);
					},
				);
		}
	}

	close() {
		this.modal.destroy();
	}
}
