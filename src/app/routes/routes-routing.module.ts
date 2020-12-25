import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { SimpleGuard } from '@delon/auth';
import { environment } from '@env/environment';
import { UserGuard } from '@shared';
// layout
import { LayoutDefaultComponent } from '../layout/default/default.component';
import { LayoutPassportComponent } from '../layout/passport/passport.component';

import { UserLockComponent } from './passport/lock/lock.component';
// passport pages
import { UserLoginComponent } from './passport/login/login.component';
import { UserRegisterResultComponent } from './passport/register-result/register-result.component';
import { UserRegisterComponent } from './passport/register/register.component';

const routes: Routes = [
	{
		path: '',
		component: LayoutDefaultComponent,
		canActivate: [UserGuard],
		canActivateChild: [UserGuard],
		children: [
			{ path: '', redirectTo: 'auth', pathMatch: 'full' },
			{
				path: 'auth',
				loadChildren: () =>
					import('./auth/auth.module').then((m) => m.AuthModule),
			},
			{
				path: 'user',
				loadChildren: () =>
					import('./user/user.module').then((m) => m.UserModule),
			},
			{
				path: 'stationery',
				loadChildren: () =>
					import('./stationery/stationery.module').then(
						(m) => m.StationeryModule,
					),
			},
			{
				path: 'writer',
				loadChildren: () =>
					import('./writer/writer.module').then(
						(m) => m.WriterModule,
					),
			},
			{
				path: 'expo',
				loadChildren: () =>
					import('./expo/expo.module').then((m) => m.ExpoModule),
			},
			{
				path: 'seller',
				loadChildren: () =>
					import('./seller/seller.module').then(
						(m) => m.SellerModule,
					),
			},
			{
				path: 'seller-manage',
				loadChildren: () =>
					import('./seller-manage/seller-manage.module').then(
						(m) => m.SellerManageModule,
					),
			},
			{
				path: 'buyer',
				loadChildren: () =>
					import('./buyer/buyer.module').then((m) => m.BuyerModule),
			},
			{
				path: 'past-expo',
				loadChildren: () =>
					import('./past-expo/past-expo.module').then(
						(m) => m.PastExpoModule,
					),
			},
			{
				path: 'recommend',
				loadChildren: () =>
					import('./recommend/recommend.module').then(
						(m) => m.RecommendModule,
					),
			},
			{
				path: 'invite',
				loadChildren: () =>
					import('./invite/invite.module').then(
						(m) => m.InviteModule,
					),
			},
			{
				path: 'promotion',
				loadChildren: () =>
					import('./promotion/promotion.module').then(
						(m) => m.PromotionModule,
					),
			},
			{
				path: 'ads',
				loadChildren: () =>
					import('./ads/ads.module').then((m) => m.AdsModule),
			},
			{
				path: 'company',
				loadChildren: () =>
					import('./company/company.module').then(
						(m) => m.CompanyModule,
					),
			},
			{
				path: 'category',
				loadChildren: () =>
					import('./category/category.module').then(
						(m) => m.CategoryModule,
					),
			},
			{
				path: 'product',
				loadChildren: () =>
					import('./product/product.module').then(
						(m) => m.ProductModule,
					),
			},
			{
				path: 'subscribe',
				loadChildren: () =>
					import('./subscribe/subscribe.module').then(
						(m) => m.SubscribeModule,
					),
			},
			{
				path: 'content',
				loadChildren: () =>
					import('./content/content.module').then(
						(m) => m.ContentModule,
					),
			},
			{
				path: 'activity',
				loadChildren: () =>
					import('./activity/activity.module').then(
						(m) => m.ActivityModule,
					),
			},
			{
				path: 'comment',
				loadChildren: () =>
					import('./comment/comment.module').then(
						(m) => m.CommentModule,
					),
			},
			{
				path: 'notice',
				loadChildren: () =>
					import('./notice/notice.module').then(
						(m) => m.NoticeModule,
					),
			},
			{
				path: 'setting',
				loadChildren: () =>
					import('./setting/setting.module').then(
						(m) => m.SettingModule,
					),
			},
			{
				path: 'article',
				loadChildren: () =>
					import('./article/article.module').then(
						(m) => m.ArticleModule,
					),
			},
			{
				path: 'expo_news',
				loadChildren: () =>
					import('./expo-news/expo-news.module').then(
						(m) => m.ExpoNewsModule,
					),
			},
			{
				path: 'discover',
				loadChildren: () =>
					import('./discover/discover.module').then(
						(m) => m.DiscoverModule,
					),
			},
			{
				path: 'video',
				loadChildren: () =>
					import('./video/video.module').then((m) => m.VideoModule),
			},
			{
				path: 'transaction',
				loadChildren: () =>
					import('./transaction/transaction.module').then(
						(m) => m.TransactionModule,
					),
			},
			// Exception
			{
				path: 'exception',
				loadChildren: () =>
					import('./exception/exception.module').then(
						(m) => m.ExceptionModule,
					),
			},
		],
	},
	// passport
	{
		path: 'passport',
		component: LayoutPassportComponent,
		children: [
			{
				path: 'login',
				component: UserLoginComponent,
				data: { title: '登录' },
			},
			{
				path: 'register',
				component: UserRegisterComponent,
				data: { title: '注册', titleI18n: 'app.register.register' },
			},
			{
				path: 'register-result',
				component: UserRegisterResultComponent,
				data: { title: '注册结果', titleI18n: 'app.register.register' },
			},
			{
				path: 'lock',
				component: UserLockComponent,
				data: { title: '锁屏', titleI18n: 'app.lock' },
			},
		],
	},
	{ path: '**', redirectTo: 'exception/404' },
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, {
			useHash: environment.useHash,
			// NOTICE: If you use `reuse-tab` component and turn on keepingScroll you can set to `disabled`
			// Pls refer to https://ng-alain.com/components/reuse-tab
			scrollPositionRestoration: 'top',
		}),
	],
	exports: [RouterModule],
})
export class RouteRoutingModule {}
