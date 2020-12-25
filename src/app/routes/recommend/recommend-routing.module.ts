import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ArticleListComponent } from './article/article-list/article-list.component';
import { CompanyListComponent } from './company/company-list/company-list.component';
import { ProductListComponent } from './product/product-list/product-list.component';
import { RecommendComponent } from './recommend.component';
import { SellerListComponent } from './seller/seller-list/seller-list.component';
import { WriterListComponent } from './writer/writer-list/writer-list.component';

const routes: Routes = [
	{
		path: '',
		component: RecommendComponent,
		children: [
			{ path: '', redirectTo: 'seller', pathMatch: 'full' },
			{ path: 'seller', component: SellerListComponent },
			{ path: 'company', component: CompanyListComponent },
			{ path: 'product', component: ProductListComponent },
			{ path: 'writer', component: WriterListComponent },
			{ path: 'article', component: ArticleListComponent },
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class RecommendRoutingModule {}
