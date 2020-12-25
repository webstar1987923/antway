import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ActivityListComponent } from './activity-list/activity-list.component';
import { ActivityComponent } from './activity.component';

const routes: Routes = [
	{
		path: '',
		component: ActivityComponent,
		children: [
			{ path: '', redirectTo: 'all', pathMatch: 'full' },
			{
				path: 'all',
				component: ActivityListComponent,
				data: { status: '' },
			},
			{
				path: 'pending',
				component: ActivityListComponent,
				data: { status: '0' },
			},
			{
				path: 'processing',
				component: ActivityListComponent,
				data: { status: '1' },
			},
			{
				path: 'closed',
				component: ActivityListComponent,
				data: { status: '2' },
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ActivityRoutingModule {}
