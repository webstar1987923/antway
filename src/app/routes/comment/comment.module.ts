import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { CommentRoutingModule } from './comment-routing.module';

import { CommentListComponent } from './comment-list/comment-list.component';
import { CommentComponent } from './comment.component';

const COMPONENTS = [CommentComponent, CommentListComponent];

const COMPONENTS_NOROUNT = [CommentListComponent];

@NgModule({
	imports: [SharedModule, CommentRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
})
export class CommentModule {}
