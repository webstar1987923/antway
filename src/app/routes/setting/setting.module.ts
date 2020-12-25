import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { SettingRoutingModule } from './setting-routing.module';

import { EmailTemplateModalComponent } from './email-template-modal/email-template-modal.component';
import { EmailTemplateComponent } from './email-template/email-template.component';
import { SettingComponent } from './setting.component';
import { SystemListComponent } from './system-list/system-list.component';

const COMPONENTS = [
	SettingComponent,
	SystemListComponent,
	EmailTemplateComponent,
	EmailTemplateModalComponent,
];

const COMPONENTS_NOROUNT = [];

@NgModule({
	imports: [SharedModule, SettingRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
})
export class SettingModule {}
