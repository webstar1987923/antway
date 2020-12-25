import { Component, OnInit } from '@angular/core';
import { SFSchema, SFTreeSelectWidgetSchema } from '@delon/form';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
	selector: 'app-team-modal',
	templateUrl: './team-modal.component.html',
})
export class TeamModalComponent implements OnInit {
	loading = false;
	data: any = {};
	schema: SFSchema;

	constructor(
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.schema = {
			properties: {
				pid: {
					type: 'string',
					title: '上级部门',
					enum: this.data.teams,
					ui: {
						widget: 'tree-select',
					} as SFTreeSelectWidgetSchema,
				},
				name: { type: 'string', title: '部门名称', maxLength: 50 },
			},
			required: ['pid', 'name'],
			ui: {
				spanLabelFixed: 150,
				grid: { span: 24 },
			},
		};
	}

	save(value: any) {
		const postData = {
			id: null,
			pid: value.pid,
			name: value.name,
		};
		console.log('postData:', postData);
		this.loading = true;
		if (this.data.record.id) {
			postData.id = this.data.record.id;
			this.comSrv.updateTeam(postData).subscribe((res: any) => {
				this.msgSrv.success(res.data.msg);
				this.modal.close(value);
				this.loading = false;
			});
		} else {
			this.comSrv.createTeam(postData).subscribe((res: any) => {
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
