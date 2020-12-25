import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { CategoryRoutingModule } from './category-routing.module';

import { GeneralModalComponent } from './general/general-modal/general-modal.component';
import { GeneralComponent } from './general/general.component';
import { ProductModalComponent } from './product/product-modal/product-modal.component';
import { ProductComponent } from './product/product.component';

const COMPONENTS = [
	ProductComponent,
	ProductModalComponent,
	GeneralComponent,
	GeneralModalComponent,
];

const COMPONENTS_NOROUNT = [ProductModalComponent, GeneralModalComponent];

@NgModule({
	imports: [SharedModule, CategoryRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
})
export class CategoryModule {}
