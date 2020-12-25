import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { InviteRoutingModule } from './invite-routing.module';

import { InviteListComponent } from './invite-list/invite-list.component';
import { InviteSettingComponent } from './invite-setting/invite-setting.component';
import { InviteViewComponent } from './invite-view/invite-view.component';
import { InviteComponent } from './invite.component';

const COMPONENTS = [
	InviteComponent,
	InviteListComponent,
	InviteSettingComponent,
];

const COMPONENTS_NOROUNT = [InviteViewComponent];

@NgModule({
	imports: [SharedModule, InviteRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
})
export class InviteModule {}
