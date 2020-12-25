import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { NoticeRoutingModule } from './notice-routing.module';

import { NoticeListComponent } from './notice-list.component';
import { NoticeModalComponent } from './notice-modal/notice-modal.component';

const COMPONENTS = [NoticeListComponent];

const COMPONENTS_NOROUNT = [NoticeListComponent, NoticeModalComponent];

@NgModule({
	imports: [SharedModule, NoticeRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
})
export class NoticeModule {}
