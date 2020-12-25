import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { CompanyRoutingModule } from './company-routing.module';

import { CompanyListComponent } from './company-list/company-list.component';
import { CreditModalComponent } from './credit-modal/credit-modal.component';
import { ViolationListComponent } from './violation-list/violation-list.component';
import { ViolationModalComponent } from './violation-modal/violation-modal.component';

const COMPONENTS = [CompanyListComponent];

const COMPONENTS_NOROUNT = [
	ViolationListComponent,
	ViolationModalComponent,
	CreditModalComponent,
];

@NgModule({
	imports: [SharedModule, CompanyRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
})
export class CompanyModule {}
