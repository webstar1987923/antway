import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserDeletedComponent } from './user-deleted/user-deleted.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserComponent } from './user.component';

const routes: Routes = [
	{
		path: '',
		component: UserComponent,
		children: [
			{ path: '', redirectTo: 'all', pathMatch: 'full' },
			{
				path: 'all',
				component: UserListComponent,
				data: { filter: 'all' },
			},
			{
				path: 'verified',
				component: UserListComponent,
				data: { filter: 'verified' },
			},
			{
				path: 'vip',
				component: UserListComponent,
				data: { filter: 'vip' },
			},
			{ path: 'deleted', component: UserDeletedComponent },
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class UserRoutingModule {}
