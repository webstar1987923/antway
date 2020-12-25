import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { BuyerRoutingModule } from './buyer-routing.module';

import { ApplicantListComponent } from './applicant-list/applicant-list.component';
import { ApplicantViewComponent } from './applicant-view/applicant-view.component';
import { BusListComponent } from './bus-list/bus-list.component';
import { BuyerComponent } from './buyer.component';

const COMPONENTS = [BuyerComponent, ApplicantListComponent, BusListComponent];

const COMPONENTS_NOROUNT = [ApplicantViewComponent];

@NgModule({
	imports: [SharedModule, BuyerRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
})
export class BuyerModule {}
