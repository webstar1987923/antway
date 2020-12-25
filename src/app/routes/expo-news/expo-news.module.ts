import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { ExpoNewsRoutingModule } from './expo-news-routing.module';

import { CommentListComponent } from './comment-list/comment-list.component';
import { ExpoNewsModalComponent } from './expo-news-modal/expo-news-modal.component';
import { ExpoNewsComponent } from './expo-news.component';

const COMPONENTS = [ExpoNewsComponent];

const COMPONENTS_NOROUNT = [ExpoNewsModalComponent, CommentListComponent];

@NgModule({
	imports: [SharedModule, ExpoNewsRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
})
export class ExpoNewsModule {}
