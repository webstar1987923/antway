import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SFComponent, SFSchema, SFSelectWidgetSchema } from '@delon/form';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
	selector: 'app-applicant-admin-binding',
	template: `
		<div class="modal-header">
			<div class="modal-title">分配业务员</div>
		</div>
		<sf #sf [schema]="schema" button="none">
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
export class ApplicantAdminBindingComponent implements OnInit {
	loading = false;
	data: any = {};
	schema: SFSchema;
	admins: any[] = [];
	@ViewChild('sf', { static: false }) private sf: SFComponent;

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.admins = this.comSrv.getCommonData().admins;
		this.schema = {
			properties: {
				admin_id: {
					type: 'string',
					title: '管理员',
					enum: this.admins,
					ui: {
						widget: 'select',
					} as SFSelectWidgetSchema,
					default: this.data.record.admin_id || null,
				},
			},
			required: ['admin_id'],
		};
	}

	save(value: any) {
		this.blkSrv.setBlockStatus(true);
		value.id = this.data.record.id;
		this.comSrv.updateExpoApplicantSeller(value).subscribe(
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
