import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StationeryListComponent } from './stationery-list/stationery-list.component';

const routes: Routes = [
	{
		path: '',
		component: StationeryListComponent,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class StationeryRoutingModule {}
