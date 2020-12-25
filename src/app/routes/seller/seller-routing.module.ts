import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ApplicantListComponent } from './applicant-list/applicant-list.component';
import { HallListComponent } from './hall-list/hall-list.component';
import { SellerComponent } from './seller.component';

const routes: Routes = [
	{
		path: '',
		component: SellerComponent,
		children: [
			{ path: '', redirectTo: 'applicant', pathMatch: 'full' },
			{ path: 'applicant', component: ApplicantListComponent },
			{ path: 'hall', component: HallListComponent },
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class SellerRoutingModule {}
