import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { PastExpoRoutingModule } from './past-expo-routing.module';

import { ExpoService } from '@shared';

import { ExpoContentComponent } from './expo-view/expo-content/expo-content.component';
import { ExpoPictureComponent } from './expo-view/expo-picture/expo-picture.component';
import { ExpoVideoComponent } from './expo-view/expo-video/expo-video.component';
import { ExpoViewComponent } from './expo-view/expo-view.component';
import { PastExpoListComponent } from './past-expo-list/past-expo-list.component';

const COMPONENTS = [PastExpoListComponent];

const COMPONENTS_NOROUNT = [
	ExpoViewComponent,
	ExpoContentComponent,
	ExpoPictureComponent,
	ExpoVideoComponent,
];

@NgModule({
	imports: [SharedModule, PastExpoRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
	providers: [ExpoService],
})
export class PastExpoModule {}
