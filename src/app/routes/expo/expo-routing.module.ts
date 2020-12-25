import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ExpoListComponent } from './expo-list/expo-list.component';

const routes: Routes = [
	{
		path: '',
		component: ExpoListComponent,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ExpoRoutingModule {}
