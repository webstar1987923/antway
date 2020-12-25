import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {
	SFCascaderWidgetSchema,
	SFComponent,
	SFRadioWidgetSchema,
	SFSchema,
	SFSelectWidgetSchema,
	SFTextWidgetSchema,
	SFTreeSelectWidgetSchema,
} from '@delon/form';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import * as _ from 'underscore';

@Component({
	selector: 'app-applicant-view',
	template: `
		<div class="modal-header">
			<div class="modal-title">广告位申请详情</div>
		</div>
		<sf #sf [schema]="schema" compact button="none"> </sf>
		<div class="modal-footer mb-0 px-lg">
			<button nz-button type="button" (click)="close()">取 消</button>
			<button
				nz-button
				type="submit"
				[nzType]="'primary'"
				(click)="save(sf.value)"
				[disabled]="!sf.valid"
			>
				确 定
			</button>
		</div>
	`,
})
export class ApplicantViewComponent implements OnInit, OnDestroy {
	data: any = {};
	status: any[] = [];
	halls: any[] = [];
	categories: any[] = [];
	areaTypes: any[] = [];
	admins: any[] = [];

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
		this.status = this.comSrv.adsSpaceApplicantStatus;

		this.schema = {
			size: 'small',
			properties: {
				company: {
					type: 'string',
					title: '公司名称',
					ui: {
						widget: 'text',
						defaultText: this.data.record.company.name
							? (this.data.record.company.name.zh || '-') +
							  ', ' +
							  (this.data.record.company.name.en || '-')
							: '',
					} as SFTextWidgetSchema,
				},
				user: {
					type: 'string',
					title: '申请人',
					ui: {
						widget: 'text',
						defaultText: this.data.record.user.name
							? (this.data.record.user.name.zh || '-') +
							  ', ' +
							  (this.data.record.user.name.en || '-')
							: '',
					} as SFTextWidgetSchema,
				},
				ads_space: {
					type: 'string',
					title: '广告位',
					ui: {
						widget: 'text',
						defaultText: this.data.record.ads_space
							? this.data.record.ads_space.name
							: '',
						grid: {
							span: 12,
						},
					} as SFTextWidgetSchema,
				},
				price: {
					type: 'string',
					title: '价格',
					ui: {
						widget: 'text',
						defaultText: this.data.record.ads_space
							? this.data.record.ads_space.price
							: '',
						grid: {
							span: 12,
						},
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
				created_at: {
					type: 'string',
					title: '申请时间',
					ui: {
						widget: 'text',
						defaultText: this.data.record.created_at
							? moment(this.data.record.created_at).format(
									'YYYY/MM/DD HH:mm:ss',
							  )
							: '',
					} as SFTextWidgetSchema,
				},
			},
			required: [],
			ui: {
				spanLabelFixed: 140,
				grid: {
					span: 24,
				},
				size: 'small',
			},
		};
	}

	ngOnDestroy() {}

	save(value: any = {}) {
		this.blkSrv.setBlockStatus(true);
		value.id = this.data.record.id;

		this.comSrv.updateAdsSpaceApplicant(value).subscribe(
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
