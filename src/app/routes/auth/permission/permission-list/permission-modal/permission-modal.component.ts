import { Component, OnInit } from '@angular/core';
import { SFSchema, SFSelectWidgetSchema } from '@delon/form';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
	selector: 'app-permission-modal',
	templateUrl: './permission-modal.component.html',
})
export class PermissionModalComponent implements OnInit {
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
					title: '系统模块',
					enum: this.data.permissionModules,
					ui: {
						widget: 'select',
					} as SFSelectWidgetSchema,
				},
				name: { type: 'string', title: '节点名称', maxLength: 50 },
				route: { type: 'string', title: '接口路径', maxLength: 50 },
			},
			required: ['name', 'route'],
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
			route: value.route,
		};
		if (this.data.record.id) {
			postData.id = this.data.record.id;
			this.comSrv.updatePermission(postData).subscribe((res: any) => {
				this.msgSrv.success(res.data.msg);
				this.modal.close(value);
				this.loading = false;
			});
		} else {
			this.comSrv.createPermission(postData).subscribe((res: any) => {
				this.msgSrv.success(res.data.msg);
				this.modal.close(value);
				this.loading = false;
			});
		}
	}

	close() {
		this.modal.destroy();
	}
}
