import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { ActivityRoutingModule } from './activity-routing.module';

import { ActivityListComponent } from './activity-list/activity-list.component';
import { ActivityModalComponent } from './activity-modal/activity-modal.component';
import { ActivityVideoComponent } from './activity-video/activity-video.component';
import { ActivityComponent } from './activity.component';
import { CommentListComponent } from './comment-list/comment-list.component';
import { SignupListComponent } from './signup-list/signup-list.component';

const COMPONENTS = [ActivityComponent, ActivityListComponent];

const COMPONENTS_NOROUNT = [
	ActivityModalComponent,
	SignupListComponent,
	CommentListComponent,
	ActivityVideoComponent,
];

@NgModule({
	imports: [SharedModule, ActivityRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
})
export class ActivityModule {}
