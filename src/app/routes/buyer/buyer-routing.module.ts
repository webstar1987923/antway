import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ApplicantListComponent } from './applicant-list/applicant-list.component';
import { BusListComponent } from './bus-list/bus-list.component';
import { BuyerComponent } from './buyer.component';

const routes: Routes = [
	{
		path: '',
		component: BuyerComponent,
		children: [
			{ path: '', redirectTo: 'applicant', pathMatch: 'full' },
			{ path: 'applicant', component: ApplicantListComponent },
			{ path: 'bus', component: BusListComponent },
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class BuyerRoutingModule {}
