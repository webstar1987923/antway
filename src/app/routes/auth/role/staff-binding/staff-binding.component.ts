import { Component, OnInit } from '@angular/core';
import { SFSchema, SFTransferWidgetSchema } from '@delon/form';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import * as _ from 'underscore';

@Component({
	selector: 'app-staff-binding',
	templateUrl: './staff-binding.component.html',
})
export class StaffBindingComponent implements OnInit {
	loading = false;
	data: any = {};
	schema: SFSchema = {
		properties: {
			admins: {
				type: 'number',
				title: '角色',
				enum: [],
				ui: {
					widget: 'transfer',
					showSearch: true,
					titles: ['选择', '已选'],
					listStyle: { width: '300px', height: '400px' },
				} as SFTransferWidgetSchema,
				default: [],
			},
		},
	};

	constructor(
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.schema.properties.admins.title = this.data.record.name
			? this.data.record.name
			: '角色';
		this.data.allEmployee.forEach((element) => {
			this.schema.properties.admins.enum.push({
				title: element.user_name + `【${element.name}】`,
				value: element.id,
			});
		});
		this.data.list.forEach((element) => {
			this.schema.properties.admins.default.push(element.id);
		});
	}

	save(value: any) {
		console.log(value);
		this.loading = true;
		this.comSrv
			.updateRole({
				id: this.data.record.id,
				admins: value.admins,
			})
			.subscribe((res: any) => {
				this.msgSrv.success('保存成功');
				this.modal.close(value);
				this.loading = false;
			});
	}

	close() {
		this.modal.destroy();
	}
}
