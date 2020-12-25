import { Component, Inject, OnDestroy, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StartupService } from '@core';
import { ReuseTabService } from '@delon/abc/reuse-tab';
import {
	DA_SERVICE_TOKEN,
	ITokenService,
	SocialOpenType,
	SocialService,
} from '@delon/auth';
import { SettingsService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { AuthenticationService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
	selector: 'passport-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.less'],
	providers: [SocialService],
})
export class UserLoginComponent implements OnDestroy {
	constructor(
		fb: FormBuilder,
		modalSrv: NzModalService,
		private route: ActivatedRoute,
		private router: Router,
		private settingsService: SettingsService,
		@Optional()
		@Inject(ReuseTabService)
		private reuseTabService: ReuseTabService,
		@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
		private authenticationService: AuthenticationService,
		private startupSrv: StartupService,
		public http: _HttpClient,
		public msg: NzMessageService,
	) {
		this.form = fb.group({
			user_name: [null, [Validators.required]],
			password: [null, [Validators.required, Validators.minLength(8)]],
		});
		modalSrv.closeAll();
	}

	// #region fields

	get user_name() {
		return this.form.controls.user_name;
	}
	get password() {
		return this.form.controls.password;
	}
	form: FormGroup;
	error = '';

	// #region get captcha

	count = 0;
	interval$: any;

	// #endregion

	getCaptcha() {
		this.count = 59;
		this.interval$ = setInterval(() => {
			this.count -= 1;
			if (this.count <= 0) {
				clearInterval(this.interval$);
			}
		}, 1000);
	}

	// #endregion

	submit() {
		this.error = '';
		this.user_name.markAsDirty();
		this.user_name.updateValueAndValidity();
		this.password.markAsDirty();
		this.password.updateValueAndValidity();
		if (this.user_name.invalid || this.password.invalid) {
			return;
		}

		// 默认配置中对所有HTTP请求都会强制 [校验](https://ng-alain.com/auth/getting-started) 用户 Token
		// 然一般来说登录请求不需要校验，因此可以在请求URL加上：`/login?_allow_anonymous=true` 表示不触发用户 Token 校验
		this.http
			.post('api/login', {
				user_name: this.user_name.value,
				password: this.password.value,
			})
			.subscribe((res: any) => {
				// 清空路由复用信息
				this.reuseTabService.clear();
				// 设置用户Token信息
				this.authenticationService.setUser(res);
				// 重新获取 StartupService 内容，我们始终认为应用信息一般都会受当前用户授权范围而影响
				this.startupSrv.load().then(() => {
					let url =
						this.route.snapshot.queryParamMap.get('returnUrl') ||
						'/';

					if (url.includes('/passport')) {
						url = '/';
					}
					this.router.navigateByUrl(url);
				});
			});
	}

	ngOnDestroy(): void {
		if (this.interval$) {
			clearInterval(this.interval$);
		}
	}
}
