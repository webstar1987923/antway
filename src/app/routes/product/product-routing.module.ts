import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { InqueryListComponent } from './inquery-list/inquery-list.component';
import { PindanListComponent } from './pindan-list/pindan-list.component';
import { ProductListComponent } from './product-list/product-list.component';
import { PurchaseListComponent } from './purchase-list/purchase-list.component';

const routes: Routes = [
	{
		path: '',
		component: ProductListComponent,
	},
	{
		path: 'purchase',
		component: PurchaseListComponent,
	},
	{
		path: 'inquery',
		component: InqueryListComponent,
	},
	{
		path: 'pindan',
		component: PindanListComponent,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ProductRoutingModule {}
