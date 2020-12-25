import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ExpoNewsComponent } from './expo-news.component';

const routes: Routes = [
	{
		path: '',
		component: ExpoNewsComponent,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ExpoNewsRoutingModule {}
