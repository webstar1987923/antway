import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { ArticleRoutingModule } from './article-routing.module';

import { ArticleModalComponent } from './article-modal/article-modal.component';
import { ArticleComponent } from './article.component';
import { CommentListComponent } from './comment-list/comment-list.component';

const COMPONENTS = [ArticleComponent];

const COMPONENTS_NOROUNT = [ArticleModalComponent, CommentListComponent];

@NgModule({
	imports: [SharedModule, ArticleRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
})
export class ArticleModule {}
