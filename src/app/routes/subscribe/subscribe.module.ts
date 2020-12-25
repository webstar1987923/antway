import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { SubscribeRoutingModule } from './subscribe-routing.module';

import { SubscribeListComponent } from './subscribe-list/subscribe-list.component';
import { SubscribeComponent } from './subscribe.component';

const COMPONENTS = [SubscribeComponent, SubscribeListComponent];

const COMPONENTS_NOROUNT = [];

@NgModule({
	imports: [SharedModule, SubscribeRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
})
export class SubscribeModule {}
