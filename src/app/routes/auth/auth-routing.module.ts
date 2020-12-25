import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PermissionBindingComponent } from './permission/permission-binding/permission-binding.component';
import { PermissionGroupComponent } from './permission/permission-group/permission-group.component';
import { PermissionListComponent } from './permission/permission-list/permission-list.component';
import { PermissionComponent } from './permission/permission.component';
import { RoleComponent } from './role/role.component';
import { StaffComponent } from './staff/staff.component';
import { TeamComponent } from './team/team.component';

const routes: Routes = [
	{
		path: 'permission',
		children: [
			{
				path: '',
				component: PermissionComponent,
				children: [
					{ path: '', redirectTo: 'binding', pathMatch: 'full' },
					{ path: 'binding', component: PermissionBindingComponent },
					{ path: 'group', component: PermissionGroupComponent },
					{ path: 'permission', component: PermissionListComponent },
				],
			},
		],
	},
	{
		path: 'role',
		component: RoleComponent,
	},
	{
		path: 'staff',
		component: StaffComponent,
	},
	{
		path: 'team',
		component: TeamComponent,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class AuthRoutingModule {}
