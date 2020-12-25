import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { VideoRoutingModule } from './video-routing.module';

import { VideoComponent } from './video.component';

const COMPONENTS = [VideoComponent];

const COMPONENTS_NOROUNT = [];

@NgModule({
	imports: [SharedModule, VideoRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
})
export class VideoModule {}
