import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SFDateWidgetSchema, SFSchema } from '@delon/form';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
	selector: 'app-violation-modal',
	template: `
		<div class="modal-header">
			<div class="modal-title">
				违规处理
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
export class ViolationModalComponent implements OnInit {
	loading = false;
	data: any = {};
	schema: SFSchema;
	status: any[];

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.status = this.comSrv.companyActiveStatus;
		this.schema = {
			properties: {
				company_status_active: {
					type: 'string',
					title: '企业状态',
					enum: this.status,
					ui: {
						widget: 'select',
						placeholder: '请选择展会',
					},
					default: this.data.record.status,
				},
				deduction_point: {
					type: 'number',
					title: '扣分',
					ui: {
						placeholder: '请输入扣分分数',
					},
				},
				description: {
					type: 'string',
					title: '违规内容',
					ui: {
						widget: 'textarea',
						autosize: { minRows: 2, maxRows: 6 },
						placeholder: '请输入违规原因发送给用户',
					},
				},
			},
			required: ['company_status', 'deduction_point', 'description'],
			ui: {
				spanLabelFixed: 150,
				grid: { span: 24 },
			},
		};
	}

	save(value: any) {
		this.blkSrv.setBlockStatus(true);
		value.company_id = this.data.record.id;
		this.comSrv.createCompanyViolation(value).subscribe(
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
