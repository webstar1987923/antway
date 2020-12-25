import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EmailTemplateComponent } from './email-template/email-template.component';
import { SettingComponent } from './setting.component';
import { SystemListComponent } from './system-list/system-list.component';

const routes: Routes = [
	{
		path: '',
		component: SettingComponent,
		children: [
			{ path: '', redirectTo: 'email', pathMatch: 'full' },
			{
				path: 'email',
				component: EmailTemplateComponent,
			},
			{
				path: 'system',
				component: SystemListComponent,
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class SettingRoutingModule {}
