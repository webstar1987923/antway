import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { RecommendRoutingModule } from './recommend-routing.module';

import { ArticleListComponent } from './article/article-list/article-list.component';
import { ArticleOrderComponent } from './article/article-order/article-order.component';
import { ArticleRecommendComponent } from './article/article-recommend/article-recommend.component';
import { CompanyListComponent } from './company/company-list/company-list.component';
import { CompanyOrderComponent } from './company/company-order/company-order.component';
import { CompanyRecommendComponent } from './company/company-recommend/company-recommend.component';
import { ProductListComponent } from './product/product-list/product-list.component';
import { ProductOrderComponent } from './product/product-order/product-order.component';
import { ProductRecommendComponent } from './product/product-recommend/product-recommend.component';
import { RecommendComponent } from './recommend.component';
import { SellerListComponent } from './seller/seller-list/seller-list.component';
import { SellerOrderComponent } from './seller/seller-order/seller-order.component';
import { SellerRecommendComponent } from './seller/seller-recommend/seller-recommend.component';
import { WriterListComponent } from './writer/writer-list/writer-list.component';
import { WriterOrderComponent } from './writer/writer-order/writer-order.component';
import { WriterRecommendComponent } from './writer/writer-recommend/writer-recommend.component';

const COMPONENTS = [
	RecommendComponent,
	SellerListComponent,
	CompanyListComponent,
	ProductListComponent,
	ArticleListComponent,
	WriterListComponent,
];

const COMPONENTS_NOROUNT = [
	SellerOrderComponent,
	SellerRecommendComponent,
	CompanyOrderComponent,
	CompanyRecommendComponent,
	ProductOrderComponent,
	ProductRecommendComponent,
	ArticleOrderComponent,
	ArticleRecommendComponent,
	WriterOrderComponent,
	WriterRecommendComponent,
];

@NgModule({
	imports: [SharedModule, RecommendRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
})
export class RecommendModule {}
