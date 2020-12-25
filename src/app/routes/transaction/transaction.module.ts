import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { TransactionRoutingModule } from './transaction-routing.module';

import { TransactionListComponent } from './transaction-list.component';

const COMPONENTS = [TransactionListComponent];

const COMPONENTS_NOROUNT = [];

@NgModule({
	imports: [SharedModule, TransactionRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
})
export class TransactionModule {}
