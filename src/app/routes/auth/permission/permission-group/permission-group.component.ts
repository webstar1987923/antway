import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnInit,
} from '@angular/core';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import * as _ from 'underscore';
import { PermissionGroupModalComponent } from './permission-group-modal/permission-group-modal.component';
import { SubModalComponent } from './sub-modal/sub-modal.component';

@Component({
	selector: 'app-permission-group',
	templateUrl: './permission-group.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionGroupComponent implements OnInit {
	permissionGroups: any[] = [];

	permissionModuleList: any[] = [];
	selectedPermissionModule: any = {};
	selectedPermissionGroup: any = {};
	originalPermissionGroup: any = {};
	allPermissions: any[] = [];
	notBindedPermissions: any[] = [];
	bindedPermissions: any[] = [];
	loading = false;

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
		const promise1 = new Promise((resolve) => {
			this.getPermissionModule(resolve);
		});
		const promise2 = new Promise((resolve) => {
			this.getAdminPermissions(resolve);
		});

		Promise.all([promise1, promise2]).then((values) => {
			if (this.selectedPermissionModule.id) {
				this.selectPermissionModule(
					this.permissionModuleList.find(
						(element) =>
							element.id === this.selectedPermissionModule.id,
					) || null,
				);
			} else {
				this.selectPermissionModule(
					this.permissionModuleList[0] || null,
				);
			}
			this.checkPermissions();
		});
	}

	getPermissionModule(resolve) {
		this.loading = true;
		this.comSrv.getPermissionModule().subscribe((res: any) => {
			this.loading = false;
			this.permissionModuleList = res.data.list;
			console.log('Permission modules:', this.permissionModuleList);
			resolve();
		});
	}

	getAdminPermissions(resolve) {
		this.loading = true;
		this.comSrv.getAdminPermissions({ active: 1 }).subscribe((res: any) => {
			this.loading = false;
			this.allPermissions = res.data.list;
			console.log('All permissions: ', this.allPermissions);
			resolve();
		});
	}

	checkPermissions() {
		if (this.selectedPermissionGroup) {
			const remainPermissions = this.selectedPermissionModule.permissions.filter(
				(element) => {
					return !(
						this.selectedPermissionGroup.permissions &&
						this.selectedPermissionGroup.permissions.some(
							(item) => item.id === element.id,
						)
					);
				},
			);
			console.log('Remain Permissions:', remainPermissions);
			this.notBindedPermissions = remainPermissions.filter(
				(element) => !element.permission_groups.length,
			);
			this.bindedPermissions = remainPermissions.filter(
				(element) => element.permission_groups.length,
			);
		}
		this.cdr.detectChanges();
	}

	selectPermissionModule(permissionModule: any) {
		this.selectedPermissionModule = permissionModule;
		this.checkPermissions();
	}

	selectPermissionGroup(permissionGroup: any) {
		if (this.selectedPermissionGroup.id !== permissionGroup.id) {
			this.originalPermissionGroup = permissionGroup;
			this.selectedPermissionGroup = JSON.parse(
				JSON.stringify(permissionGroup),
			);
			this.checkPermissions();
		}
	}

	removePermissionGroup(permissionGroup: any) {
		this.modalSrv.confirm({
			nzTitle: '<strong>是否确定删除<strong>',
			nzContent: '删除后就无法挽回咯~',
			nzOkType: 'danger',
			nzOnOk: () => {
				this.loading = true;
				this.comSrv
					.deletePermissionGroup(permissionGroup.id)
					.subscribe(() => {
						this.loading = false;
						this.refreshData();
					});
			},
		});
	}

	removePermissionModule(permissionModule: any) {
		this.modalSrv.confirm({
			nzTitle: '<strong>是否确定删除<strong>',
			nzContent: '删除后就无法挽回咯~',
			nzOkType: 'danger',
			nzOnOk: () => {
				this.loading = true;
				this.comSrv
					.deletePermissionModule(permissionModule.id)
					.subscribe(() => {
						this.loading = false;
						this.refreshData();
					});
			},
		});
	}

	openPermissionGroupModal(record: any = {}) {
		const allPermissionModules = [];
		// this.permissionModuleList.forEach(element => {
		// allPermissionModules.push({ value: element.id, label: element.name });
		this.selectedPermissionModule.children.forEach((item) => {
			allPermissionModules.push({ value: item.id, label: item.name });
		});
		// })
		this.modal
			.create(
				PermissionGroupModalComponent,
				{ data: { record, allPermissionModules } },
				{ size: 'md' },
			)
			.subscribe((res) => {
				this.refreshData();
			});
	}

	openPermissionModuleModal(record: any = {}) {
		this.modal
			.create(
				SubModalComponent,
				{ data: { record, pid: this.selectedPermissionModule.id } },
				{ size: 'md' },
			)
			.subscribe((res) => {
				this.refreshData();
			});
	}

	addPermission(permission) {
		this.selectedPermissionGroup.permissions.push(permission);
		this.checkPermissions();
	}

	removePermission(permission) {
		this.selectedPermissionGroup.permissions.splice(
			this.selectedPermissionGroup.permissions.findIndex(
				(element) => element.id === permission.id,
			),
			1,
		);
		this.checkPermissions();
	}

	preventDefault(e: Event): void {
		e.preventDefault();
		e.stopPropagation();
	}

	savePermissionGroup() {
		this.loading = true;
		this.comSrv
			.updatePermissionGroup({
				...this.selectedPermissionGroup,
				permissions: _.pluck(
					this.selectedPermissionGroup.permissions,
					'id',
				),
			})
			.subscribe((res: any) => {
				this.loading = false;
				this.refreshData();
				this.cdr.detectChanges();
			});
	}

	existChange() {
		if (
			this.originalPermissionGroup.permissions.length !==
			this.selectedPermissionGroup.permissions.length
		) {
			return true;
		}
		this.originalPermissionGroup.permissions.forEach((element) => {
			if (
				!this.selectedPermissionGroup.permissions.some(
					(item) => item.id === element.id,
				)
			) {
				return true;
			}
		});
		return false;
	}
}
