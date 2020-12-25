import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SFComponent, SFDateWidgetSchema, SFSchema } from '@delon/form';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
	selector: 'app-writer-transaction',
	template: `
		<div class="modal-header">
			<div class="modal-title">分配稿费</div>
		</div>
		<sf #sf mode="edit" [schema]="schema" button="none">
			<div class="modal-footer">
				<button nz-button type="button" (click)="close()">取 消</button>
				<button
					nz-button
					type="submit"
					[nzType]="'primary'"
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
export class WriterTransactionComponent implements OnInit {
	loading = false;
	data: any = {};
	@ViewChild('sf', { static: false }) sf: SFComponent;
	schema: SFSchema;
	sellers: any[] = [];

	constructor(
		private blkSrv: BlockUIService,
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
				},
				description: {
					type: 'string',
					title: '说明',
					ui: {
						widget: 'textarea',
						autosize: { minRows: 2, maxRows: 6 },
					},
				},
			},
			required: ['amount'],
			ui: {
				spanLabelFixed: 100,
				grid: { span: 24 },
			},
		};
	}

	save(value: any) {
		this.blkSrv.setBlockStatus(true);
		const postData = {
			...value,
			user_id: this.data.record.id,
		};
		this.comSrv.payArticleFee(postData).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.msgSrv.success(res.data.msg);
				this.modal.close('ok');
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
