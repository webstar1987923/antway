import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { WriterRoutingModule } from './writer-routing.module';

import { WriterListComponent } from './writer-list/writer-list.component';
import { WriterTransactionComponent } from './writer-transaction/writer-transaction.component';
import { WriterComponent } from './writer.component';

const COMPONENTS = [
	WriterComponent,
	WriterListComponent,
	WriterTransactionComponent,
];

const COMPONENTS_NOROUNT = [];

@NgModule({
	imports: [SharedModule, WriterRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
})
export class WriterModule {}
