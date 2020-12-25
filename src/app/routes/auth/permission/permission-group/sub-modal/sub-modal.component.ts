import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { SFSchema } from '@delon/form';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
	selector: 'app-sub-modal',
	templateUrl: './sub-modal.component.html',
})
export class SubModalComponent {
	loading = false;
	data: any = {};
	schema: SFSchema = {
		properties: {
			name: { type: 'string', title: '分组名称', maxLength: 50 },
		},
		required: ['name'],
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
		console.log(this.data.record);
		this.loading = true;
		const postData = {
			id: null,
			pid: this.data.pid,
			name: value.name,
		};
		if (this.data.record.id) {
			postData.id = this.data.record.id;
			this.comSrv.updatePermissionModule(postData).subscribe(
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
			this.comSrv.createPermissionModule(postData).subscribe(
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
