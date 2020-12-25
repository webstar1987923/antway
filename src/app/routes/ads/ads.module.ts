import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { AdsRoutingModule } from './ads-routing.module';

import { AdsSpaceListComponent } from './ads-space/ads-space-list/ads-space-list.component';
import { AdsSpaceModalComponent } from './ads-space/ads-space-modal/ads-space-modal.component';
import { AdsComponent } from './ads.component';
import { ApplicantListComponent } from './applicant-list/applicant-list.component';
import { ApplicantViewComponent } from './applicant-view/applicant-view.component';
import { SiteAdsListComponent } from './site-ads/site-ads-list/site-ads-list.component';
import { SiteAdsModalComponent } from './site-ads/site-ads-modal/site-ads-modal.component';

const COMPONENTS = [
	AdsComponent,
	ApplicantListComponent,
	AdsSpaceListComponent,
	SiteAdsListComponent,
];

const COMPONENTS_NOROUNT = [
	AdsSpaceModalComponent,
	ApplicantViewComponent,
	SiteAdsModalComponent,
];

@NgModule({
	imports: [SharedModule, AdsRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
})
export class AdsModule {}
