import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdsListComponent } from './ads-list/ads-list.component';
import { BadgeListComponent } from './badge-list/badge-list.component';
import { DeviceListComponent } from './device-list/device-list.component';
import { LintelListComponent } from './lintel-list/lintel-list.component';
import { ProceedListComponent } from './proceed-list/proceed-list.component';
import { SellerManageComponent } from './seller-manage.component';
import { WaterListComponent } from './water-list/water-list.component';

const routes: Routes = [
	{
		path: '',
		component: SellerManageComponent,
		children: [
			{ path: '', redirectTo: 'badge', pathMatch: 'full' },
			{ path: 'badge', component: BadgeListComponent },
			{ path: 'device', component: DeviceListComponent },
			{ path: 'water', component: WaterListComponent },
			{ path: 'lintel', component: LintelListComponent },
			{ path: 'ads', component: AdsListComponent },
			{ path: 'proceed', component: ProceedListComponent },
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class SellerManageRoutingModule {}
