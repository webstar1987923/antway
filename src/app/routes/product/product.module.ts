import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { ProductRoutingModule } from './product-routing.module';

import { InqueryListComponent } from './inquery-list/inquery-list.component';
import { InqueryViewComponent } from './inquery-view/inquery-view.component';
import { PindanListComponent } from './pindan-list/pindan-list.component';
import { PindanViewComponent } from './pindan-view/pindan-view.component';
import { ProductListComponent } from './product-list/product-list.component';
import { PurchaseListComponent } from './purchase-list/purchase-list.component';
import { PurchaseViewComponent } from './purchase-view/purchase-view.component';

const COMPONENTS = [
	ProductListComponent,
	PurchaseListComponent,
	InqueryListComponent,
	PindanListComponent,
];

const COMPONENTS_NOROUNT = [
	InqueryViewComponent,
	PindanViewComponent,
	PurchaseViewComponent,
];

@NgModule({
	imports: [SharedModule, ProductRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
})
export class ProductModule {}
