import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SFComponent, SFSchema } from '@delon/form';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
	selector: 'app-staff-modal',
	templateUrl: './staff-modal.component.html',
})
export class StaffModalComponent implements OnInit {
	loading = false;
	data: any = {};
	schema: SFSchema;
	@ViewChild('sf', { static: true }) sf: SFComponent;

	constructor(
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		if (this.data.record.id == null) {
			this.schema = {
				properties: {
					user_name: { type: 'string', title: '账号', maxLength: 50 },
					name: { type: 'string', title: '姓名', maxLength: 50 },
					email: { type: 'string', title: '邮箱地址', maxLength: 50 },
					phone: { type: 'string', title: '手机号', maxLength: 50 },
					password: {
						type: 'string',
						title: '登录密码',
						maxLength: 50,
						minLength: 8,
					},
					password_confirmation: {
						type: 'string',
						title: '确认密码',
						maxLength: 50,
						ui: {
							validator: (val) =>
								this.sf.value &&
								this.sf.value.password &&
								val !== this.sf.value.password
									? [
											{
												keyword: 'password',
												message: '密码不同一',
											},
									  ]
									: [],
						},
					},
				},
				required: [
					'user_name',
					'name',
					'email',
					'phone',
					'password',
					'password_confirmation',
				],
				ui: {
					spanLabelFixed: 150,
					grid: { span: 24 },
				},
			};
		} else if (this.data.action === 'resetPassword') {
			this.schema = {
				properties: {
					password: {
						type: 'string',
						title: '登录密码',
						maxLength: 50,
						minLength: 8,
					},
					password_confirmation: {
						type: 'string',
						title: '确认密码',
						maxLength: 50,
						ui: {
							validator: (val) =>
								this.sf.value &&
								this.sf.value.password &&
								val !== this.sf.value.password
									? [
											{
												keyword: 'password',
												message: '密码不同一',
											},
									  ]
									: [],
						},
					},
				},
				required: ['password', 'password_confirmation'],
				ui: {
					spanLabelFixed: 150,
					grid: { span: 24 },
				},
			};
		} else {
			this.schema = {
				properties: {
					user_name: { type: 'string', title: '账号', maxLength: 50 },
					name: { type: 'string', title: '姓名', maxLength: 50 },
					email: { type: 'string', title: '邮箱地址', maxLength: 50 },
					phone: { type: 'string', title: '手机号', maxLength: 50 },
				},
				required: ['user_name', 'name', 'email', 'phone'],
				ui: {
					spanLabelFixed: 150,
					grid: { span: 24 },
				},
			};
		}
	}

	save(value: any) {
		this.loading = true;
		const postData = {
			id: null,
			user_name: value.user_name,
			name: value.name,
			phone: value.phone,
			password: null,
			password_confirmation: null,
		};
		if (this.data.action === 'resetPassword') {
			postData.password = this.data.record.password;
			postData.password_confirmation = this.data.record.password_confirmation;
		}
		if (this.data.record.id == null) {
			this.comSrv.createAdmin(value).subscribe(
				(res: any) => {
					this.msgSrv.success('保存成功');
					this.modal.close(value);
				},
				(err: HttpErrorResponse) => {
					this.loading = false;
				},
			);
		} else {
			postData.id = this.data.record.id;
			this.comSrv.updateAdmin(value).subscribe(
				(res: any) => {
					this.msgSrv.success('保存成功');
					this.modal.close(value);
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
