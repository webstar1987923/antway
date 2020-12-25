import { HttpErrorResponse } from '@angular/common/http';
import {
	ChangeDetectorRef,
	Component,
	OnInit,
	TemplateRef,
	ViewChild,
} from '@angular/core';
import { STChange, STColumn, STComponent, STData } from '@delon/abc/st';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import * as _ from 'underscore';
import { StaffModalComponent } from './staff-modal/staff-modal.component';

@Component({
	selector: 'app-staff-list',
	templateUrl: './staff.component.html',
})
export class StaffComponent implements OnInit {
	queryParams: any = {
		pi: 1,
		ps: 10,
		sorter: '',
		status: null,
		statusList: [],
	};
	total = 0;
	list: any[] = [];
	loading = false;
	status = [];
	@ViewChild('st', { static: true })
	st: STComponent;
	columns: STColumn[] = [
		{ title: '', index: 'id', type: 'checkbox' },
		{ title: '账号', index: 'user_name' },
		{ title: '姓名', index: 'name' },
		{ title: '邮箱地址', index: 'email' },
		{ title: '手机号', index: 'phone' },
		{
			title: '角色',
			index: 'roles',
			format: (item, _col) => _.pluck(item.roles, 'name').join(', '),
		},
		{
			title: '状态',
			index: 'status',
			render: 'status',
			filter: {
				menus: this.status,
				fn: (filter: any, record: any) =>
					record.status === filter.index,
			},
		},
		{
			title: '操作',
			buttons: [
				{
					text: '修改',
					click: (item: any) => this.openStaffModal(item),
				},
				{
					text: '修改密码',
					click: (item: any) =>
						this.openStaffModal(item, 'resetPassword'),
				},
				{
					text: '启用',
					iif: (item: STData) => item.status === 1,
					click: (item: any) => this.changeAdminStatus(item.id, 0),
				},
				{
					text: '禁用',
					iif: (item: STData) => item.status === 0,
					click: (item: any) => this.changeAdminStatus(item.id, 1),
				},
			],
		},
	];
	selectedRows: STData[] = [];
	totalCallNo = 0;

	constructor(
		private cdr: ChangeDetectorRef,
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: ModalHelper,
		private modalSrv: NzModalService,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.status = this.comSrv.adminStatus;
		this.getData();
	}

	getData() {
		this.queryParams.statusList = this.status
			.filter((w) => w.checked)
			.map((item) => item.index);
		if (this.queryParams.status !== null && this.queryParams.status > -1) {
			this.queryParams.statusList.push(this.queryParams.status);
		}

		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});

		this.loading = true;
		this.comSrv.getAdmins(this.queryParams).subscribe((res: any) => {
			this.loading = false;
			this.total = res.data.total;
			this.list = res.data.list;
			this.cdr.detectChanges();
		});
	}

	stChange(e: STChange) {
		console.log(e);
		switch (e.type) {
			case 'checkbox':
				this.selectedRows = e.checkbox;
				this.totalCallNo = this.selectedRows.reduce(
					(total, cv) => total + cv.callNo,
					0,
				);
				this.cdr.detectChanges();
				break;
			case 'filter':
				this.getData();
				break;
			case 'pi':
				this.queryParams.pi = e.pi;
				this.getData();
				break;
			case 'ps':
				this.queryParams.ps = e.ps;
				this.getData();
				break;
		}
	}

	remove(id?) {
		const ids = id ? id : this.selectedRows.map((i) => i.id).join(',');
		if (ids) {
			this.modalSrv.confirm({
				nzTitle: '<strong>是否确定删除<strong>',
				nzContent: '删除后就无法挽回咯~',
				nzOkType: 'danger',
				nzOnOk: () => {
					this.loading = true;
					this.comSrv.deleteAdmin(ids).subscribe(
						() => {
							this.loading = false;
							this.getData();
							this.st.clearCheck();
						},
						(err: HttpErrorResponse) => {
							this.loading = false;
						},
					);
				},
			});
		} else {
			this.msgSrv.info('选择');
		}
	}

	changeAdminStatus(id: number, status: number) {
		const ids = id ? id : this.selectedRows.map((i) => i.id).join(',');
		this.modalSrv.confirm({
			nzTitle: `<strong>是否确定${this.status[status].label}<strong>`,
			nzOkType: status ? 'danger' : 'primary',
			nzOnOk: () => {
				this.blkSrv.setBlockStatus(true);
				const postData = {
					ids,
					status,
				};
				this.comSrv.changeAdminStatus(postData).subscribe(
					() => {
						this.blkSrv.setBlockStatus(false);
						this.getData();
					},
					(err: HttpErrorResponse) => {
						this.blkSrv.setBlockStatus(false);
					},
				);
			},
		});
	}

	openStaffModal(record: any = {}, action: string = '') {
		this.modal
			.create(
				StaffModalComponent,
				{ data: { record, action } },
				{ size: 'md' },
			)
			.subscribe((res) => {
				this.getData();
				this.cdr.detectChanges();
			});
	}

	reset() {
		// wait form reset updated finished
		setTimeout(() => this.getData());
	}
}
