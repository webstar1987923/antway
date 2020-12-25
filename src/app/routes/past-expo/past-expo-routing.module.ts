import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PastExpoListComponent } from './past-expo-list/past-expo-list.component';

const routes: Routes = [
	{
		path: '',
		component: PastExpoListComponent,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class PastExpoRoutingModule {}
