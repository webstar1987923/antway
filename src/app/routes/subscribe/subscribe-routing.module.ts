import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SubscribeListComponent } from './subscribe-list/subscribe-list.component';
import { SubscribeComponent } from './subscribe.component';

const routes: Routes = [
	{
		path: '',
		component: SubscribeComponent,
		children: [
			{ path: '', redirectTo: 'purchase', pathMatch: 'full' },
			{
				path: 'purchase',
				component: SubscribeListComponent,
				data: { filter: 'purchase' },
			},
			{
				path: 'product',
				component: SubscribeListComponent,
				data: { filter: 'product' },
			},
			{
				path: 'article',
				component: SubscribeListComponent,
				data: { filter: 'article' },
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class SubscribeRoutingModule {}
