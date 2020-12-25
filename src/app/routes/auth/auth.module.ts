import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { AuthRoutingModule } from './auth-routing.module';

import { PermissionBindingComponent } from './permission/permission-binding/permission-binding.component';
import { PermissionGroupModalComponent } from './permission/permission-group/permission-group-modal/permission-group-modal.component';
import { PermissionGroupComponent } from './permission/permission-group/permission-group.component';
import { SubModalComponent } from './permission/permission-group/sub-modal/sub-modal.component';
import { PermissionListComponent } from './permission/permission-list/permission-list.component';
import { PermissionModalComponent } from './permission/permission-list/permission-modal/permission-modal.component';
import { PermissionComponent } from './permission/permission.component';
import { RoleModalComponent } from './role-modal/role-modal.component';
import { RoleComponent } from './role/role.component';
import { StaffBindingComponent } from './role/staff-binding/staff-binding.component';
import { StaffModalComponent } from './staff/staff-modal/staff-modal.component';
import { StaffComponent } from './staff/staff.component';
import { TeamBindingComponent } from './team/team-binding/team-binding.component';
import { TeamModalComponent } from './team/team-modal/team-modal.component';
import { TeamComponent } from './team/team.component';

const COMPONENTS = [
	PermissionComponent,
	PermissionBindingComponent,
	PermissionGroupComponent,
	PermissionListComponent,
	SubModalComponent,
	PermissionGroupModalComponent,
	PermissionModalComponent,
	RoleModalComponent,
	RoleComponent,
	StaffComponent,
	StaffModalComponent,
	StaffBindingComponent,
	TeamComponent,
	TeamBindingComponent,
	TeamModalComponent,
];

const COMPONENTS_NOROUNT = [
	SubModalComponent,
	PermissionGroupModalComponent,
	PermissionModalComponent,
	RoleModalComponent,
	StaffModalComponent,
	StaffBindingComponent,
	TeamBindingComponent,
	TeamModalComponent,
];

@NgModule({
	imports: [SharedModule, AuthRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
})
export class AuthModule {}
