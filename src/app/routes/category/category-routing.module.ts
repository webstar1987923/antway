import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GeneralComponent } from './general/general.component';
import { ProductComponent } from './product/product.component';

const routes: Routes = [
	{
		path: 'product',
		component: ProductComponent,
	},
	{ path: 'news', component: GeneralComponent, data: { tag: 'news' } },
	{
		path: 'product_unit',
		component: GeneralComponent,
		data: { tag: 'product_unit' },
	},
	{
		path: 'occupation',
		component: GeneralComponent,
		data: { tag: 'occupation' },
	},
	{
		path: 'mgmodel',
		component: GeneralComponent,
		data: { tag: 'mgmodel' },
	},
	{
		path: 'advertising',
		component: GeneralComponent,
		data: { tag: 'advertising' },
	},
	{
		path: 'preference',
		component: GeneralComponent,
		data: { tag: 'preference' },
	},
	{
		path: 'expo_menu',
		component: GeneralComponent,
		data: { tag: 'expo_menu' },
	},
	{
		path: 'expo_content',
		component: GeneralComponent,
		data: { tag: 'expo_content' },
	},
	{
		path: 'past_expo_content',
		component: GeneralComponent,
		data: { tag: 'past_expo_content' },
	},
	{
		path: 'survey_seller',
		component: GeneralComponent,
		data: { tag: 'survey_seller' },
	},
	{
		path: 'survey_buyer',
		component: GeneralComponent,
		data: { tag: 'survey_buyer' },
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class CategoryRoutingModule {}
