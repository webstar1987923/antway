import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
	SFArrayWidgetSchema,
	SFComponent,
	SFDateWidgetSchema,
	SFSchema,
} from '@delon/form';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import * as moment from 'moment';
import * as _ from 'underscore';

@Component({
	selector: 'app-bus-modal',
	templateUrl: './bus-modal.component.html',
})
export class BusModalComponent implements OnInit {
	loading = false;
	data: any = {};
	@ViewChild('sf', { static: false }) sf: SFComponent;
	schema: SFSchema;
	dates: any[] = [];
	status: any[];

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.dates = [];
		if (this.data.record.date) {
			this.data.record.date.split(',').forEach((element) => {
				this.dates.push(new Date(element));
			});
		}
		this.schema = {
			properties: {
				name_zh: {
					type: 'string',
					title: '班次名称',
					maxLength: 50,
					ui: {
						optional: '中文',
						placeholder: '请输入中文班次名称',
					},
					default: this.data.record.name
						? this.data.record.name.zh
						: '',
				},
				name_en: {
					type: 'string',
					title: '班次名称',
					maxLength: 50,
					ui: {
						optional: '英文',
						placeholder: '请输入英文班次名称',
					},
					default: this.data.record.name
						? this.data.record.name.en
						: '',
				},
			},
			required: ['name_zh', 'name_en'],
			ui: {
				spanLabelFixed: 150,
				grid: { span: 24 },
			},
		};
	}

	addDate() {
		this.dates.push(null);
	}

	removeDate(index) {
		this.dates.splice(index, 1);
	}

	save(value: any) {
		this.blkSrv.setBlockStatus(true);
		const postData = { ...value };
		postData.expo_id = this.data.expo_id;
		postData.date = [];
		this.dates = _.sortBy(this.dates);
		this.dates.forEach((element) => {
			const date = moment(element);
			if (date.isValid()) {
				postData.date.push(date.format('YYYY-MM-DD'));
			}
		});
		postData.date = postData.date.join(',');
		if (this.data.record.id == null) {
			this.comSrv.createBus(postData).subscribe(
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
		} else {
			postData.id = this.data.record.id;
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
	}

	close() {
		this.modal.destroy();
	}
}
