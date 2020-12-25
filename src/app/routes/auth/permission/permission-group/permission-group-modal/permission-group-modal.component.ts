import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SFSchema, SFSelectWidgetSchema } from '@delon/form';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
	selector: 'app-permission-group-modal',
	templateUrl: './permission-group-modal.component.html',
})
export class PermissionGroupModalComponent implements OnInit {
	loading = false;
	data: any = {};
	schema: SFSchema;

	constructor(
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		console.log(this.data.allPermissionModules);
		this.schema = {
			properties: {
				module_id: {
					type: 'string',
					title: '所属分组',
					enum: this.data.allPermissionModules,
					ui: {
						widget: 'select',
					} as SFSelectWidgetSchema,
				},
				name: { type: 'string', title: '权限组名称', maxLength: 50 },
			},
			required: ['module_id', 'name'],
			ui: {
				spanLabelFixed: 150,
				grid: { span: 24 },
			},
		};
	}

	save(value: any) {
		this.loading = true;
		const postData = {
			id: null,
			module_id: value.module_id,
			name: value.name,
		};
		if (this.data.record.id) {
			postData.id = this.data.record.id;
			this.comSrv.updatePermissionGroup(postData).subscribe(
				(res: any) => {
					this.msgSrv.success(res.data.msg);
					this.modal.close(value);
					this.loading = false;
				},
				(err: HttpErrorResponse) => {
					this.loading = false;
				},
			);
		} else {
			this.comSrv.createPermissionGroup(postData).subscribe(
				(res: any) => {
					this.msgSrv.success(res.data.msg);
					this.modal.close(value);
					this.loading = false;
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
