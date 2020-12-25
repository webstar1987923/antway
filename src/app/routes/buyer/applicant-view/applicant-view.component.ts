import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { STChange, STColumn, STComponent, STData } from '@delon/abc/st';
import {
	SFComponent,
	SFSchema,
	SFSelectWidgetSchema,
	SFTextWidgetSchema,
} from '@delon/form';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-applicant-view',
	templateUrl: './applicant-view.component.html',
	styleUrls: ['./applicant-view.component.less'],
})
export class ApplicantViewComponent implements OnInit, OnDestroy {
	data: any = {};
	selectedTab = 0;
	status: any[] = [];
	resultStatus: any[] = [];

	@ViewChild('sf', { static: false }) sf: SFComponent;
	schema: SFSchema;

	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{ title: '姓名', index: 'name' },
		{ title: '手机号', index: 'mobile' },
		{ title: '邮箱', index: 'email' },
		{ title: '邀请时间', type: 'date', index: 'created_at' },
	];

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.status = this.comSrv.expoBuyerStatus.filter(
			(element) => element.value > 1,
		);
		this.resultStatus = this.comSrv.expoBuyerResultStatus;

		this.refreshSchema();

		this.getData();
	}

	ngOnDestroy() {}

	refreshSchema() {
		this.schema = {
			size: 'small',
			properties: {
				expo: {
					type: 'string',
					title: '举办名称',
					ui: {
						widget: 'text',
						defaultText: this.data.record.expo.name.zh,
					} as SFTextWidgetSchema,
				},
				user: {
					type: 'string',
					title: '负责人',
					ui: {
						widget: 'text',
						defaultText: this.data.record.user.name.zh,
					} as SFTextWidgetSchema,
				},
				company: {
					type: 'string',
					title: '公司名称',
					ui: {
						widget: 'text',
						defaultText:
							this.data.record.user &&
							this.data.record.user.company
								? this.data.record.user.company.name.zh
								: '',
					} as SFTextWidgetSchema,
				},
				phone: {
					type: 'string',
					title: '手机号',
					ui: {
						widget: 'text',
						defaultText: this.data.record.user.phone,
					} as SFTextWidgetSchema,
				},
				email: {
					type: 'string',
					title: '邮箱',
					ui: {
						widget: 'text',
						defaultText: this.data.record.user.email,
					} as SFTextWidgetSchema,
				},
				is_visited: {
					type: 'string',
					title: '参观状态',
					enum: this.resultStatus,
					ui: {
						widget: 'select',
					} as SFSelectWidgetSchema,
					default: this.data.record.is_visited,
				},
				numbering: {
					type: 'string',
					title: '编号',
					ui: {
						widget: 'text',
						defaultText: this.data.record.cert_code,
					} as SFTextWidgetSchema,
				},
				friends: {
					type: 'string',
					title: '邀请数量',
					ui: {
						widget: 'text',
						defaultText: this.data.record.friend_cnt || '0',
					} as SFTextWidgetSchema,
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
		this.blkSrv.setBlockStatus(true);
		this.comSrv.getExpoApplicantBuyer(this.data.record.id).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.data.record = res.data;
				this.refreshSchema();
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	save() {
		this.blkSrv.setBlockStatus(true);
		const postData = {
			id: this.data.record.id,
			...this.sf.value,
		};

		this.comSrv.updateExpoApplicantBuyer(postData).subscribe(
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
