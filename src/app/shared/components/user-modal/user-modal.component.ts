import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { CommonService } from '../../services/common.service';

@Component({
	selector: 'app-user-modal',
	templateUrl: './user-modal.component.html',
})
export class UserModalComponent implements OnInit {
	loading = false;
	data: any = {};
	validateForm!: FormGroup;

	confirmationValidator = (
		control: FormControl,
	): { [s: string]: boolean } => {
		if (!control.value) {
			return { required: true };
		} else if (
			control.value !== this.validateForm.controls.password.value
		) {
			return { confirm: true, error: true };
		}
		return {};
	};

	constructor(
		private comSrv: CommonService,
		private fb: FormBuilder,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		if (this.data.record.id == null) {
			this.validateForm = this.fb.group({
				email: [null],
				phone_prefix: [null],
				phone: [null],
				password: [null],
				password_confirmation: [null, [this.confirmationValidator]],
			});
		} else if (this.data.action === 'resetPassword') {
			this.validateForm = this.fb.group({
				password: [null],
				password_confirmation: [null, [this.confirmationValidator]],
			});
		} else {
			this.validateForm = this.fb.group({
				email: [this.data.record.email],
				phone_prefix: [this.data.record.phone_prefix],
				phone: [this.data.record.phone],
			});
		}
	}

	save(value: any) {
		this.loading = true;
		if (this.data.record.id == null) {
			if (this.data.company_id) {
				value.company_id = this.data.company_id;
			}
			this.comSrv.createUser(value).subscribe(
				(res: any) => {
					this.loading = false;
					this.msgSrv.success(res.data.msg);
					this.modal.close(value);
				},
				(err: HttpErrorResponse) => {
					this.loading = false;
				},
			);
		} else if (this.data.action === 'resetPassword') {
			value.id = this.data.record.id;
			this.comSrv.changeUserPassword(value).subscribe(
				(res: any) => {
					this.loading = false;
					this.msgSrv.success(res.data.msg);
					this.modal.close(value);
				},
				(err: HttpErrorResponse) => {
					this.loading = false;
				},
			);
		} else {
			value.id = this.data.record.id;
			this.comSrv.updateUser(value).subscribe(
				(res: any) => {
					this.loading = false;
					this.msgSrv.success(res.data.msg);
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
