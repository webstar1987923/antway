import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { SellerManageRoutingModule } from './seller-manage-routing.module';

import { AdsListComponent } from './ads-list/ads-list.component';
import { AdsViewComponent } from './ads-view/ads-view.component';
import { BadgeListComponent } from './badge-list/badge-list.component';
import { BadgeViewComponent } from './badge-view/badge-view.component';
import { DeviceListComponent } from './device-list/device-list.component';
import { DeviceViewComponent } from './device-view/device-view.component';
import { LintelListComponent } from './lintel-list/lintel-list.component';
import { LintelViewComponent } from './lintel-view/lintel-view.component';
import { ProceedListComponent } from './proceed-list/proceed-list.component';
import { ProceedViewComponent } from './proceed-view/proceed-view.component';
import { SellerManageComponent } from './seller-manage.component';
import { WaterListComponent } from './water-list/water-list.component';
import { WaterViewComponent } from './water-view/water-view.component';

const COMPONENTS = [
	SellerManageComponent,
	BadgeListComponent,
	DeviceListComponent,
	WaterListComponent,
	LintelListComponent,
	AdsListComponent,
	ProceedListComponent,
];

const COMPONENTS_NOROUNT = [
	BadgeViewComponent,
	DeviceViewComponent,
	WaterViewComponent,
	AdsViewComponent,
	LintelViewComponent,
	ProceedViewComponent,
];

@NgModule({
	imports: [SharedModule, SellerManageRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
})
export class SellerManageModule {}
