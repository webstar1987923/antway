import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { ContentRoutingModule } from './content-routing.module';

import { ContentComponent } from './content.component';

const COMPONENTS = [ContentComponent];

const COMPONENTS_NOROUNT = [];

@NgModule({
	imports: [SharedModule, ContentRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
	providers: [],
})
export class ContentModule {}
