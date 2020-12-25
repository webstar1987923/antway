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
import { RoleModalComponent } from '../../role-modal/role-modal.component';

@Component({
	selector: 'app-permission-binding',
	templateUrl: './permission-binding.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionBindingComponent implements OnInit {
	// endregion
	roles: any[] = [];
	allPermissionModuleList: any[] = [];
	permissionModuleList: any[] = [];

	locked = true;
	allChecked = true;
	indeterminate = false;
	selectedRole: any = {};
	loading = false;

	constructor(
		private cdr: ChangeDetectorRef,
		private comSrv: CommonService,
		private modal: ModalHelper,
		private modalSrv: NzModalService,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.getRoles();
		this.getPermissionModule();
	}

	getRoles() {
		this.comSrv.getRoles().subscribe((res: any) => {
			console.log('Roles:', res.data.list);
			this.roles = res.data.list;
			if (this.roles.length) {
				if (this.selectedRole.id) {
					this.selectRole(
						this.roles.find(
							(element) => element.id === this.selectedRole.id,
						) || this.roles[0],
					);
				} else {
					this.selectRole(this.roles[0]);
				}
			}
			this.cdr.detectChanges();
		});
	}

	getPermissionModule() {
		this.comSrv.getPermissionModule().subscribe((res: any) => {
			this.allPermissionModuleList = res.data.list;
			this.initPermissionModule();
			console.log('Permission modules:', this.allPermissionModuleList);
		});
	}

	initPermissionModule() {
		console.log('Loding:', this.loading);
		if (this.selectedRole.id) {
			this.locked = this.selectedRole.locked;
			// this.permissionModuleList = JSON.parse(JSON.stringify(this.allPermissionModuleList));
			this.permissionModuleList = _.reduce(
				this.allPermissionModuleList,
				(acc, val) => {
					return acc.concat(val.children);
				},
				[],
			);
			this.permissionModuleList.forEach((element) => {
				element.permission_groups.forEach((item) => {
					if (
						this.selectedRole.permission_groups.find(
							(val) => val.id === item.id,
						)
					) {
						item.checked = true;
					} else {
						item.checked = false;
					}
				});
				if (element.permission_groups.every((val) => !val.checked)) {
					element.allChecked = false;
					element.indeterminate = false;
				} else if (
					element.permission_groups.every((item) => item.checked)
				) {
					element.allChecked = true;
					element.indeterminate = false;
				} else {
					element.allChecked = false;
					element.indeterminate = true;
				}
				if (
					this.selectedRole.permission_modules.some(
						(item) => item.id === element.id,
					)
				) {
					element.locked = true;
				}
			});

			if (this.permissionModuleList.every((val) => !val.checked)) {
				this.allChecked = false;
				this.indeterminate = false;
			} else if (
				this.permissionModuleList.every((item) => item.checked)
			) {
				this.allChecked = true;
				this.indeterminate = false;
			} else {
				this.allChecked = false;
				this.indeterminate = true;
			}
			this.cdr.detectChanges();
			console.log(
				'Role binded permission groups:',
				this.permissionModuleList,
			);
		}
	}

	selectRole(role: any) {
		this.selectedRole = role;
		this.initPermissionModule();
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
					this.cdr.detectChanges();
				});
			},
		});
	}

	openRoleModal(record: any = {}) {
		this.modal
			.create(RoleModalComponent, { data: { record } }, { size: 'md' })
			.subscribe((res) => {
				this.getRoles();
				this.cdr.detectChanges();
			});
	}

	// Permission checkbox
	updateAllChecked(moduleId?): void {
		console.log(moduleId);
		if (moduleId != null) {
			console.log('one');
			if (this.permissionModuleList.every((item) => !item.allChecked)) {
				this.allChecked = false;
				this.indeterminate = false;
			} else if (
				this.permissionModuleList.every((item) => item.allChecked)
			) {
				this.allChecked = true;
				this.indeterminate = false;
			} else {
				this.allChecked = false;
				this.indeterminate = true;
			}

			this.permissionModuleList[moduleId].indeterminate = false;
			if (this.permissionModuleList[moduleId].allChecked) {
				this.permissionModuleList[
					moduleId
				].permission_groups = this.permissionModuleList[
					moduleId
				].permission_groups.map((item) => {
					return {
						...item,
						checked: true,
					};
				});
			} else {
				this.permissionModuleList[
					moduleId
				].permission_groups = this.permissionModuleList[
					moduleId
				].permission_groups.map((item) => {
					return {
						...item,
						checked: false,
					};
				});
			}
		} else {
			console.log('all');
			this.indeterminate = false;
			if (this.allChecked) {
				this.permissionModuleList = this.permissionModuleList.map(
					(item) => {
						return {
							...item,
							indeterminate: false,
							allChecked: true,
						};
					},
				);
			} else {
				this.permissionModuleList = this.permissionModuleList.map(
					(item) => {
						return {
							...item,
							indeterminate: false,
							allChecked: false,
						};
					},
				);
			}
			this.permissionModuleList.forEach((element) => {
				if (element.allChecked) {
					element.permission_groups = element.permission_groups.map(
						(item) => {
							return {
								...item,
								checked: true,
							};
						},
					);
				} else {
					element.permission_groups = element.permission_groups.map(
						(item) => {
							return {
								...item,
								checked: false,
							};
						},
					);
				}
			});
		}
		this.cdr.detectChanges();
	}

	updateSingleChecked(moduleId): void {
		const checkOptionsOne = this.permissionModuleList[moduleId]
			.permission_groups;
		if (checkOptionsOne.every((item) => !item.checked)) {
			this.permissionModuleList[moduleId].allChecked = false;
			this.permissionModuleList[moduleId].indeterminate = false;
		} else if (checkOptionsOne.every((item) => item.checked)) {
			this.permissionModuleList[moduleId].allChecked = true;
			this.permissionModuleList[moduleId].indeterminate = false;
		} else {
			this.permissionModuleList[moduleId].allChecked = false;
			this.permissionModuleList[moduleId].indeterminate = true;
		}

		if (this.permissionModuleList.every((item) => !item.allChecked)) {
			this.allChecked = false;
			this.indeterminate = false;
		} else if (this.permissionModuleList.every((item) => item.allChecked)) {
			this.allChecked = true;
			this.indeterminate = false;
		} else {
			this.allChecked = false;
			this.indeterminate = true;
		}
	}

	savePermissionGroups() {
		this.loading = true;
		console.log(this.permissionModuleList);
		const permissionGroupIds = [];
		const lockedPermissionModuleIds = [];
		this.permissionModuleList.forEach((element) => {
			element.permission_groups.forEach((item) => {
				if (item.checked) {
					permissionGroupIds.push(item.id);
				}
			});
			if (element.locked) {
				lockedPermissionModuleIds.push(element.id);
			}
		});
		console.log('Checked ids:', permissionGroupIds);
		console.log('Locked permission module ids:', lockedPermissionModuleIds);
		this.comSrv
			.updateRole({
				id: this.selectedRole.id,
				locked: this.locked,
				permission_groups: permissionGroupIds,
				permission_modules: lockedPermissionModuleIds,
			})
			.subscribe((res: any) => {
				this.loading = false;
				this.getRoles();
				this.cdr.detectChanges();
			});
	}
}
