import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { InviteListComponent } from './invite-list/invite-list.component';
import { InviteSettingComponent } from './invite-setting/invite-setting.component';
import { InviteComponent } from './invite.component';

const routes: Routes = [
	{
		path: '',
		component: InviteComponent,
		children: [
			{ path: '', redirectTo: 'share', pathMatch: 'full' },
			{ path: 'share', component: InviteListComponent },
			{ path: 'setting', component: InviteSettingComponent },
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class InviteRoutingModule {}
