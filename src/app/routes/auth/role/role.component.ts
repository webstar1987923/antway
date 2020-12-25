import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { STChange, STColumn, STComponent, STData } from '@delon/abc/st';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import * as _ from 'underscore';
import { RoleModalComponent } from '../role-modal/role-modal.component';
import { StaffBindingComponent } from './staff-binding/staff-binding.component';

@Component({
	selector: 'app-role-layout',
	templateUrl: './role.component.html',
})
export class RoleComponent implements OnInit {
	queryParams: any = {
		pi: 1,
		ps: 10,
		roleId: '',
		sorter: '',
		status: null,
		statusList: [],
	};
	roles: any[] = [];
	selectedRole: any = {};
	loading = false;
	admins: any[] = [];

	total = 0;
	list: any[] = [];
	status = [];
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{ title: '', index: 'id', type: 'checkbox' },
		{ title: '账号', index: 'user_name' },
		{ title: '姓名', index: 'name' },
		{
			title: '角色',
			index: 'role',
			format: (item, _col) => _.pluck(item.roles, 'name').join(', '),
		},
		{ title: '状态', index: 'status', render: 'status' },
	];
	selectedRows: STData[] = [];
	totalCallNo = 0;

	constructor(
		private cdr: ChangeDetectorRef,
		private comSrv: CommonService,
		private modal: ModalHelper,
		private modalSrv: NzModalService,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		// this.modules = []
		this.status = this.comSrv.adminStatus;
		this.getRoles();
		this.getAdmins();
	}

	getRoles() {
		this.comSrv.getRoles().subscribe((res: any) => {
			console.log('Roles:', res.data.list);
			this.roles = res.data.list;
			if (this.selectedRole.id) {
				this.selectRole(
					this.roles.find(
						(element) => element.id === this.selectedRole.id,
					),
				);
			} else {
				this.selectRole(this.roles[0]);
			}
			this.cdr.detectChanges();
		});
	}

	selectRole(role: any) {
		this.selectedRole = role;
	}

	openRoleModal(record: any = {}) {
		this.modal
			.create(RoleModalComponent, { data: { record } }, { size: 'md' })
			.subscribe((res) => {
				this.getRoles();
				this.cdr.detectChanges();
			});
	}

	deleteRole(role: any) {
		const modal = this.modalSrv.confirm({
			nzTitle: '<strong>是否确定删除<strong>',
			nzContent: '删除后就无法挽回咯~',
			nzOkType: 'danger',
			nzOnOk: () => {
				this.loading = true;
				this.comSrv.deleteRole(role.id).subscribe((res: any) => {
					this.loading = false;
					this.getRoles();
				});
			},
		});
	}

	getAdmins() {
		this.loading = true;
		this.comSrv.getAdmins().subscribe((res: any) => {
			this.loading = false;
			this.admins = res.data.list;
			console.log('All admins:', this.admins);
		});
	}

	stChange(e: STChange) {
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
				break;
			case 'pi':
				this.queryParams.pi = e.pi;
				// this.getAdmins();
				break;
			case 'ps':
				this.queryParams.ps = e.ps;
				// this.getAdmins();
				break;
		}
	}

	openStaffBinding() {
		this.modal
			.create(
				StaffBindingComponent,
				{
					data: {
						record: this.selectedRole,
						allEmployee: this.admins,
						list: this.selectedRole.admins,
					},
				},
				{ size: 900 },
			)
			.subscribe((res) => {
				this.getRoles();
			});
	}
}
