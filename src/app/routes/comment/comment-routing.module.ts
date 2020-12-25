import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CommentListComponent } from './comment-list/comment-list.component';
import { CommentComponent } from './comment.component';

const routes: Routes = [
	{
		path: '',
		component: CommentComponent,
		children: [
			{ path: '', redirectTo: 'all', pathMatch: 'full' },
			{
				path: 'all',
				component: CommentListComponent,
				data: { filter: '' },
			},
			{
				path: 'deleted',
				component: CommentListComponent,
				data: { filter: 'deleted' },
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class CommentRoutingModule {}
