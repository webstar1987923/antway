import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { StationeryRoutingModule } from './stationery-routing.module';

import { StationeryListComponent } from './stationery-list/stationery-list.component';

const COMPONENTS = [StationeryListComponent];

const COMPONENTS_NOROUNT = [];

@NgModule({
	imports: [SharedModule, StationeryRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
})
export class StationeryModule {}
