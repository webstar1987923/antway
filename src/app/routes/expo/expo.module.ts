import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { ExpoRoutingModule } from './expo-routing.module';

import { ExpoService } from '@shared';

import { ExpoListComponent } from './expo-list/expo-list.component';
import { ExpoModalComponent } from './expo-modal/expo-modal.component';
import { ExpoTypeModalComponent } from './expo-type-modal/expo-type-modal.component';
import { BuildingListComponent } from './expo-view/building-list/building-list.component';
import { BusDescriptionComponent } from './expo-view/bus-description/bus-description.component';
import { BusListComponent } from './expo-view/bus-list/bus-list.component';
import { BusModalComponent } from './expo-view/bus-modal/bus-modal.component';
import { CooperativeImageComponent } from './expo-view/cooperative-image/cooperative-image.component';
import { ExpoBannerComponent } from './expo-view/expo-banner/expo-banner.component';
import { ExpoCardComponent } from './expo-view/expo-card/expo-card.component';
import { ExpoContentComponent } from './expo-view/expo-content/expo-content.component';
import { ExpoSettingComponent } from './expo-view/expo-setting/expo-setting.component';
import { ExpoViewComponent } from './expo-view/expo-view.component';
import { HallListComponent } from './expo-view/hall-list/hall-list.component';
import { HallSettingComponent } from './expo-view/hall-setting/hall-setting.component';
import { MapModalComponent } from './expo-view/map-modal/map-modal.component';

const COMPONENTS = [ExpoListComponent];

const COMPONENTS_NOROUNT = [
	ExpoTypeModalComponent,
	ExpoModalComponent,
	ExpoViewComponent,
	ExpoContentComponent,
	ExpoSettingComponent,
	ExpoBannerComponent,
	BusListComponent,
	BusModalComponent,
	BusDescriptionComponent,
	HallSettingComponent,
	ExpoCardComponent,
	CooperativeImageComponent,
	MapModalComponent,
	BuildingListComponent,
	HallListComponent,
];

@NgModule({
	imports: [SharedModule, ExpoRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
	providers: [ExpoService],
})
export class ExpoModule {}
