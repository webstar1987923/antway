import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';

// Delon
import { SFComponent, SFDateWidgetSchema, SFSchema } from '@delon/form';

// Zorro
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

// Constants
import { TransactionType } from '../../constants/transaction-type.constant';

// Custom services
import { CommonService } from '../../services/common.service';

// Plugins
import * as _ from 'underscore';

@Component({
	selector: 'app-pay-modal',
	template: `
		<div class="modal-header">
			<div class="modal-title">支付</div>
		</div>
		<sf
			#sf
			mode="edit"
			[schema]="schema"
			[formData]="data.record"
			button="none"
		>
			<div class="modal-footer">
				<button nz-button type="button" (click)="close()">取 消</button>
				<button
					nz-button
					type="submit"
					nzType="primary"
					[nzLoading]="loading"
					(click)="save(sf.value)"
					[disabled]="!sf.valid"
				>
					确 定
				</button>
			</div>
		</sf>
	`,
})
export class PayModalComponent implements OnInit {
	loading = false;
	data: any = {};
	schema: SFSchema;
	@ViewChild('sf', { static: true }) sf: SFComponent;

	constructor(
		private cdr: ChangeDetectorRef,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.schema = {
			properties: {
				amount: {
					type: 'number',
					title: '金额',
					default: this.data.record.amount || null,
				},
				processed_at: {
					type: 'string',
					title: '处理时间',
					format: 'date-time',
					ui: {
						widget: 'date',
					} as SFDateWidgetSchema,
					default: this.data.record.processed_at || null,
				},
				string: {
					type: 'string',
					title: '设明',
					ui: {
						widget: 'textarea',
						autosize: { minRows: 1, maxRows: 6 },
					},
					default: this.data.record.description || null,
				},
			},
			required: ['amount', 'processed_at'],
		};
	}

	save(value: any) {
		this.loading = true;
		const postData = {
			...this.data.record,
			...value,
		};
		if (this.data.record.type === TransactionType.SELLER_APPLICANT) {
			postData.id = this.data.seller_id;
			this.comSrv.payExpoApplicantSeller(postData).subscribe(
				(res: any) => {
					this.loading = false;
					this.msgSrv.success(res.data.msg);
					this.modal.close(res);
				},
				(err: HttpErrorResponse) => {
					this.loading = false;
				},
			);
		} else {
			this.comSrv.createTransaction(postData).subscribe(
				(res: any) => {
					this.loading = false;
					this.msgSrv.success(res.data.msg);
					this.modal.close(res);
				},
				(err: HttpErrorResponse) => {
					this.loading = false;
				},
			);
		}
	}

	close() {
		this.modal.destroy();
	}
}
