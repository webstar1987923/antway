import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { PromotionRoutingModule } from './promotion-routing.module';

import { PromotionListComponent } from './promotion-list/promotion-list.component';

const COMPONENTS = [PromotionListComponent];

const COMPONENTS_NOROUNT = [];

@NgModule({
	imports: [SharedModule, PromotionRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
})
export class PromotionModule {}
