import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SFDateWidgetSchema, SFSchema } from '@delon/form';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
	selector: 'app-credit-modal',
	template: `
		<div class="modal-header">
			<div class="modal-title">
				修改信用分
			</div>
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
export class CreditModalComponent implements OnInit {
	loading = false;
	data: any = {};
	schema: SFSchema;

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.schema = {
			properties: {
				credit_score: {
					type: 'number',
					title: '信用分',
					ui: {
						placeholder: '请输入信用分',
						widgetWidth: 300,
					},
					default: this.data.record.credit_score,
				},
			},
			required: ['credit_score'],
			ui: {
				spanLabelFixed: 150,
				grid: { span: 24 },
			},
		};
	}

	save(value: any) {
		this.blkSrv.setBlockStatus(true);
		value.id = this.data.record.id;
		this.comSrv.updateCompany(value).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.msgSrv.success('保存成功');
				this.modal.close(res);
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
