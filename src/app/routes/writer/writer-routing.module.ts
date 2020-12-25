import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WriterListComponent } from './writer-list/writer-list.component';
import { WriterComponent } from './writer.component';

const routes: Routes = [
	{
		path: '',
		component: WriterComponent,
		children: [
			{
				path: '',
				component: WriterListComponent,
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class WriterRoutingModule {}
