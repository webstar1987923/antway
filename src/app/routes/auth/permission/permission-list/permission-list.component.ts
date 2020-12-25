import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnInit,
	ViewChild,
} from '@angular/core';
import { STChange, STColumn, STComponent, STData } from '@delon/abc/st';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import * as _ from 'underscore';
import { PermissionModalComponent } from './permission-modal/permission-modal.component';

@Component({
	selector: 'app-permission-list',
	templateUrl: './permission-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionListComponent implements OnInit {
	queryParams: any = {
		pi: 1,
		ps: 10,
		sorter: '',
	};
	permissionGroups: any[] = [];

	permissionModuleList: any[] = [];
	selectedPermissionModule: any = {};
	selectedPermissionGroup: any = {};
	originalPermissionGroup: any = {};
	total = 0;
	list: any[] = [];
	loading = false;
	status = [];
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{ title: '', index: 'id', type: 'checkbox' },
		{ title: '节点名称', index: 'name' },
		{ title: '接口路径', index: 'route' },
		{ title: '启用状态', index: 'status', render: 'status' },
		{
			title: '系统模块',
			index: 'permission_module',
			format: (item, _col) => `${item.permission_module.name}`,
		},
		{
			title: '绑定权限组',
			index: 'permission_groups',
			// format: (item, _col) => _.pluck(item.permission_groups, 'name').join(', ')
			format: (item, _col) =>
				_.reduce(
					item.permission_groups,
					(acc, val: any) => {
						const name =
							val.permission_module.name + '/' + val.name;
						return acc ? acc + ', ' + name : name;
					},
					'',
				),
		},
		{
			title: '操作',
			buttons: [
				{
					text: '编辑',
					click: (item: any) => this.openPermissionModal(item),
				},
				{
					text: (item, _col) => (item.status === 1 ? '禁用' : '启用'),
					click: (item: any) =>
						this.changeStatus(item.status === 1 ? 0 : 1, item),
				},
				{
					text: '删除',
					click: (item: any) => this.remove(item.id),
				},
			],
		},
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
		this.refreshData();
	}

	refreshData() {
		this.getPermissionModule();
	}

	getPermissionModule() {
		this.loading = true;
		this.comSrv.getPermissionModule().subscribe((res: any) => {
			this.loading = false;
			this.permissionModuleList = [{ name: '所有模块' }].concat(
				res.data.list,
			);
			this.selectPermissionModule(this.permissionModuleList[0]);
			console.log('Permission modules:', this.permissionModuleList);
		});
	}

	getAdminPermissions() {
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});

		this.loading = true;
		this.comSrv
			.getAdminPermissions(this.queryParams)
			.subscribe((res: any) => {
				this.loading = false;
				this.total = res.data.total;
				this.list = res.data.list;
				console.log('Permissions: ', this.list);
				this.cdr.detectChanges();
			});
	}

	selectPermissionModule(permissionModule: any) {
		this.selectedPermissionModule = permissionModule;
		this.queryParams.pm_id = this.selectedPermissionModule.id;
		this.getAdminPermissions();
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
				this.getAdminPermissions();
				break;
			case 'pi':
				this.queryParams.pi = e.pi;
				this.getAdminPermissions();
				break;
			case 'ps':
				this.queryParams.ps = e.ps;
				this.getAdminPermissions();
				break;
		}
	}

	openPermissionModal(record: any = {}, action: string = '') {
		const permissionModules = [];
		this.permissionModuleList.forEach((element) => {
			if (element.id) {
				permissionModules.push({
					value: element.id,
					label: element.name,
				});
			}
		});
		this.modal
			.create(
				PermissionModalComponent,
				{
					data: {
						record,
						action,
						permissionModules,
					},
				},
				{ size: 'md' },
			)
			.subscribe((res) => {
				this.getAdminPermissions();
			});
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
					this.cdr.detectChanges();
					this.comSrv.deletePermission(ids).subscribe(() => {
						this.loading = false;
						this.getAdminPermissions();
					});
				},
			});
		} else {
			this.msgSrv.info('选择');
		}
	}

	changeStatus(status, item?) {
		const ids = item
			? item.id
			: this.selectedRows.map((i) => i.id).join(',');
		if (ids) {
			this.modalSrv.confirm({
				nzTitle: `<strong>是否确定${status ? '启用' : '禁用'}<strong>`,
				// nzContent: '删除后就无法挽回咯~',
				nzOkType: status ? 'primary' : 'danger',
				nzOnOk: () => {
					this.loading = true;
					this.cdr.detectChanges();
					this.comSrv
						.changePermissionStatus({ ids, status })
						.subscribe(() => {
							this.loading = false;
							this.getAdminPermissions();
						});
				},
			});
		} else {
			this.msgSrv.info('选择');
		}
	}

	reset() {
		// wait form reset updated finished
		setTimeout(() => this.getAdminPermissions());
	}
}
