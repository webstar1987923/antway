import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { DiscoverRoutingModule } from './discover-routing.module';

import { CommentListComponent } from './comment-list/comment-list.component';
import { DiscoverModalComponent } from './discover-modal/discover-modal.component';
import { DiscoverComponent } from './discover.component';

const COMPONENTS = [DiscoverComponent];

const COMPONENTS_NOROUNT = [DiscoverModalComponent, CommentListComponent];

@NgModule({
	imports: [SharedModule, DiscoverRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
})
export class DiscoverModule {}
