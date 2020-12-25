import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdsSpaceListComponent } from './ads-space/ads-space-list/ads-space-list.component';
import { AdsComponent } from './ads.component';
import { ApplicantListComponent } from './applicant-list/applicant-list.component';
import { SiteAdsListComponent } from './site-ads/site-ads-list/site-ads-list.component';

const routes: Routes = [
	{
		path: '',
		component: AdsComponent,
		children: [
			{ path: '', redirectTo: 'applicant', pathMatch: 'full' },
			{ path: 'applicant', component: ApplicantListComponent },
			{ path: 'space', component: AdsSpaceListComponent },
			{ path: 'site-ads', component: SiteAdsListComponent },
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class AdsRoutingModule {}
