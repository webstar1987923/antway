import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { SellerRoutingModule } from './seller-routing.module';

import { ApplicantAdminBindingComponent } from './applicant-admin-binding/applicant-admin-binding.component';
import { ApplicantListComponent } from './applicant-list/applicant-list.component';
import { HallListComponent } from './hall-list/hall-list.component';
import { SellerComponent } from './seller.component';

const COMPONENTS = [
	SellerComponent,
	ApplicantListComponent,
	HallListComponent,
	ApplicantAdminBindingComponent,
];

const COMPONENTS_NOROUNT = [ApplicantAdminBindingComponent];

@NgModule({
	imports: [SharedModule, SellerRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
})
export class SellerModule {}
