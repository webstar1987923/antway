import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { SFSchema } from '@delon/form';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
	selector: 'app-role-modal',
	templateUrl: './role-modal.component.html',
})
export class RoleModalComponent {
	loading = false;
	data: any = {};
	schema: SFSchema = {
		properties: {
			name: { type: 'string', title: '角色名称', maxLength: 50 },
			description: {
				type: 'string',
				title: '角色说明',
				maxLength: 50,
				ui: {
					widget: 'textarea',
					autosize: { minRows: 2, maxRows: 6 },
				},
			},
		},
		required: ['name', 'description'],
		ui: {
			spanLabelFixed: 150,
			grid: { span: 24 },
		},
	};

	constructor(
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	save(value: any) {
		this.loading = true;
		const postData = {
			id: null,
			name: value.name,
			description: value.description,
		};
		if (this.data.record.id == null) {
			this.comSrv.createRole(postData).subscribe(
				(res: any) => {
					this.msgSrv.success('保存成功');
					this.modal.close(res);
				},
				(err: HttpErrorResponse) => {
					this.loading = false;
				},
			);
		} else {
			postData.id = this.data.record.id;
			this.comSrv.updateRole(postData).subscribe(
				(res: any) => {
					this.msgSrv.success('保存成功');
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
