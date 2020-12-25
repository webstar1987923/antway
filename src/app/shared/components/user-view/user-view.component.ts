import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

// Delon
import { STColumn, STComponent } from '@delon/abc/st';
import { SFComponent, SFSchema, SFSelectWidgetSchema } from '@delon/form';
import { ModalHelper } from '@delon/theme';

// Zorro
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

// Models
import { Company } from '../../models/company.model';
import { User } from '../../models/user.model';
import { Viplog } from '../../models/viplog.model';

// Constants
import { CompanyStatusCst } from '../../constants/company-status.constant';

// Custom services
import { BlockUIService } from '../../services/block-ui.service';
import { CommonService } from '../../services/common.service';

// Plugins
import * as moment from 'moment';

// Components
import { UserTransactionComponent } from '../user-transaction/user-transaction.component';

@Component({
	selector: 'app-user-view',
	templateUrl: './user-view.component.html',
	styleUrls: ['./user-view.component.less'],
})
export class UserViewComponent implements OnInit, OnDestroy {
	data: any = {};
	user: User = new User();
	company: Company = new Company();
	selectedTab = 0;
	status: any[] = [];
	writerStatus: any[] = [];
	countries: any[] = [];
	regions: any[] = [];
	cities: any[] = [];
	mgmodels: any[] = [];
	gender: any = {};
	currencyType: any = {};
	editVipTodate = false;
	editStationeryTodate = false;
	editStationeryMembers = false;
	editEmail = false;
	editPhone = false;
	commonDataSubscription: Subscription;
	readonly CompanyStatusCst = CompanyStatusCst;

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
		private modalHelper: ModalHelper,
	) {}

	ngOnInit() {
		this.commonDataSubscription = this.comSrv
			.getCommonDataUpdates()
			.subscribe((res: any) => {
				this.countries = res.countries;
				this.mgmodels = res.mgmodels;
			});
		this.status = this.comSrv.userStatus;
		this.writerStatus = this.comSrv.writerStatus;
		this.gender = this.comSrv.gender;
		this.currencyType = this.comSrv.currencyType;
		this.getData();
	}

	ngOnDestroy() {
		this.commonDataSubscription.unsubscribe();
	}

	getData() {
		this.blkSrv.setBlockStatus(true);
		this.comSrv.getUser(this.data.record.id).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.data.record = res.data;
				this.refresh();
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	refresh() {
		this.company = new Company(this.data.record.company);
		this.user = new User(this.data.record);
		console.log(this.company);
		this.selectCountry();
		this.selectRegion();
		this.editVipTodate = false;
		this.editStationeryTodate = false;
		this.editStationeryMembers = false;
		this.editEmail = false;
		this.editPhone = false;
	}

	selectTab(idx: number) {
		this.selectedTab = idx;
	}

	save(resolve?) {
		const postData = {
			id: this.data.record.id,
			name_en: this.user.name.en || 'null',
			name_zh: this.user.name.zh || 'null',
			gender: this.user.gender,
			position_en: this.user.position.en || 'null',
			position_zh: this.user.position.zh || 'null',
			wechat: this.user.wechat,
			qq: this.user.qq,
			company: null,
		};
		if (
			this.company.id ||
			this.company.phone ||
			this.company.fax ||
			this.company.mgmodel_id ||
			this.company.country_code ||
			this.company.region_id ||
			this.company.city_id ||
			this.company.postal ||
			this.company.second_domain ||
			this.company.website ||
			this.company.name.en ||
			this.company.name.zh ||
			this.company.address.en ||
			this.company.address.zh
		) {
			// Save company
			postData.company = {
				id: this.company.id || '',
				phone: this.company.phone,
				fax: this.company.fax,
				mgmodel_id: this.company.mgmodel_id,
				country_code: this.company.country_code || null,
				region_id: this.company.region_id,
				city_id: this.company.city_id,
				postal: this.company.postal,
				second_domain: this.company.second_domain,
				website: this.company.website,
				name_en: this.company.name.en || 'null',
				name_zh: this.company.name.zh || 'null',
				address_en: this.company.address.en || 'null',
				address_zh: this.company.address.zh || 'null',
			};
		}
		this.blkSrv.setBlockStatus(true);
		this.comSrv.updateUser(postData).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.msgSrv.success(res.data.msg);
				this.data.record = res.data.rlt;
				this.refresh();
				if (resolve) {
					resolve();
				}
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	savePhone(resolve?) {
		const postData = {
			id: this.data.record.id,
			phone_prefix: this.user.phone_prefix,
			phone: this.user.phone,
		};
		this.blkSrv.setBlockStatus(true);
		this.comSrv.changeUserPhone(postData).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.msgSrv.success(res.data.msg);
				this.data.record = res.data.rlt;
				this.refresh();
				if (resolve) {
					resolve();
				}
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	saveEmail(resolve?) {
		const postData = {
			id: this.data.record.id,
			email: this.user.email,
		};
		this.blkSrv.setBlockStatus(true);
		this.comSrv.changeUserEmail(postData).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.msgSrv.success(res.data.msg);
				this.data.record = res.data.rlt;
				this.refresh();
				if (resolve) {
					resolve();
				}
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	saveWriterStatus(status_writer, requireSave?) {
		this.beforeVerify(requireSave).then(() => {
			if (!status_writer || this.enableUserVerify()) {
				const postData = {
					id: this.data.record.id,
					status_writer,
				};
				this.blkSrv.setBlockStatus(true);
				this.comSrv.changeUserWriterStatus(postData).subscribe(
					(res: any) => {
						this.blkSrv.setBlockStatus(false);
						this.msgSrv.success(res.data.msg);
						this.data.record = res.data.rlt;
						this.refresh();
					},
					(err: HttpErrorResponse) => {
						this.blkSrv.setBlockStatus(false);
					},
				);
			}
		});
	}

	saveVerifyStatus(status_verified, requireSave?) {
		this.beforeVerify(requireSave).then(() => {
			if (!status_verified || this.enableUserVerify()) {
				const postData = {
					id: this.data.record.id,
					status_verified,
				};
				this.blkSrv.setBlockStatus(true);
				this.comSrv.changeUserVerifyStatus(postData).subscribe(
					(res: any) => {
						this.blkSrv.setBlockStatus(false);
						this.msgSrv.success(res.data.msg);
						this.data.record = res.data.rlt;
						this.refresh();
					},
					(err: HttpErrorResponse) => {
						this.blkSrv.setBlockStatus(false);
					},
				);
			}
		});
	}

	saveCompanyVerifyStatus(status, requireSave?) {
		this.beforeVerify(requireSave).then(() => {
			if (
				status !== CompanyStatusCst.COMPANY_VERIFIED ||
				this.enableCompanyVerify()
			) {
				const postData = {
					id: this.data.record.company.id,
					status,
				};
				this.blkSrv.setBlockStatus(true);
				this.comSrv.changeCompanyVerifyStatus(postData).subscribe(
					(res: any) => {
						this.blkSrv.setBlockStatus(false);
						this.msgSrv.success(res.data.msg);
						this.data.record.company = res.data.rlt;
						this.refresh();
					},
					(err: HttpErrorResponse) => {
						this.blkSrv.setBlockStatus(false);
					},
				);
			}
		});
	}

	saveVip() {
		const postData = {
			id: this.data.record.id,
			log_id: this.user.viplog.id || '',
			todate: this.user.viplog.todate.getTime() / 1000 || 0,
		};

		this.blkSrv.setBlockStatus(true);
		this.comSrv.changeUserVip(postData).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.msgSrv.success(res.data.msg);
				this.data.record = res.data.rlt;
				this.refresh();
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	saveVipStatus(status) {
		const postData = {
			id: this.data.record.id,
			log_id: this.user.viplog.id || '',
			todate: new Date(this.user.viplog.todate).getTime() / 1000 || 0,
			status,
		};
		this.blkSrv.setBlockStatus(true);
		this.comSrv.changeUserVip(postData).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.msgSrv.success(res.data.msg);
				this.data.record = res.data.rlt;
				this.refresh();
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	saveStationery() {
		const postData = {
			id: this.data.record.id,
			company_id: this.data.record.company_id,
			log_id: this.company.stationerylog.id || '',
			todate: this.company.stationerylog.todate.getTime() / 1000 || 0,
		};

		this.blkSrv.setBlockStatus(true);
		this.comSrv.changeUserStationery(postData).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.msgSrv.success(res.data.msg);
				this.data.record = res.data.rlt;
				this.refresh();
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	saveStationeryStatus(status) {
		const postData = {
			id: this.data.record.id,
			company_id: this.data.record.company_id,
			log_id: this.company.stationerylog.id || '',
			todate:
				new Date(this.company.stationerylog.todate).getTime() / 1000 ||
				0,
			status,
		};
		this.blkSrv.setBlockStatus(true);
		this.comSrv.changeUserStationery(postData).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.msgSrv.success(res.data.msg);
				this.data.record = res.data.rlt;
				this.refresh();
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	saveStationeryMembers() {
		const postData = {
			id: this.data.record.id,
			company_id: this.data.record.company_id,
			stationery_members: this.company.stationery_members,
		};
		this.blkSrv.setBlockStatus(true);
		this.comSrv.changeUserStationeryMembers(postData).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.msgSrv.success(res.data.msg);
				this.data.record = res.data.rlt;
				this.refresh();
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	close() {
		this.modal.destroy('Ok');
	}

	selectCountry() {
		if (this.company.country_code) {
			if (this.company.country_code === 'CHN') {
				this.regions = this.comSrv.getCommonData().chinaRegions;
			} else {
				this.regions = [];
			}
			// const country = this.countries.find(
			// 	(element) => element.code === this.company.country_code,
			// );
			// this.blkSrv.setBlockStatus(true);
			// this.comSrv.getRegions({ id: country.id }).subscribe(
			// 	(res: any) => {
			// 		this.blkSrv.setBlockStatus(false);
			// 		this.regions = res.data.list;
			// 	},
			// 	(err: HttpErrorResponse) => {
			// 		this.blkSrv.setBlockStatus(false);
			// 	},
			// );
		}
	}

	selectRegion() {
		if (this.company.region_id) {
			this.cities = this.regions.find(
				(element) => element.id === this.company.region_id,
			).children;
			// this.blkSrv.setBlockStatus(true);
			// this.comSrv.getRegions({ id: this.company.region_id }).subscribe(
			// 	(res: any) => {
			// 		this.blkSrv.setBlockStatus(false);
			// 		this.cities = res.data.list;
			// 	},
			// 	(err: HttpErrorResponse) => {
			// 		this.blkSrv.setBlockStatus(false);
			// 	},
			// );
		}
	}

	isValidVip(value: Viplog) {
		return !!value && value.status === 2;
	}

	enableUserVerify() {
		let errorMsg = '';
		if (
			!(
				this.data.record.name?.zh &&
				this.data.record.gender + '' &&
				this.data.record.position?.zh
			) &&
			!(
				this.data.record.name?.en &&
				this.data.record.gender + '' &&
				this.data.record.position?.en
			)
		) {
			errorMsg +=
				(this.data.record.name.zh ? '' : ', 中文姓名') +
				(this.data.record.name.en ? '' : ', 英文姓名') +
				(this.data.record.gender + '' ? '' : ', 称呼') +
				(this.data.record.position.zh ? '' : ', 中文职务') +
				(this.data.record.position.en ? '' : ', 英文职务');
		}
		errorMsg +=
			(this.data.record.phone ? '' : ', 手机') +
			(this.data.record.email ? '' : ', 邮箱地址');
		if (!errorMsg) {
			return true;
		} else {
			this.msgSrv.error(`请填写必填项(${errorMsg.slice(2)})，无法认证`);
			return false;
		}
	}

	enableCompanyVerify() {
		let errorMsg = '';
		if (
			!(
				this.data.record.name?.zh &&
				this.data.record.gender + '' &&
				this.data.record.position?.zh
			) &&
			!(
				this.data.record.name?.en &&
				this.data.record.gender + '' &&
				this.data.record.position?.en
			)
		) {
			errorMsg +=
				(this.data.record.name.zh ? '' : ', 中文姓名') +
				(this.data.record.name.en ? '' : ', 英文姓名') +
				(this.data.record.gender + '' ? '' : ', 称呼') +
				(this.data.record.position.zh ? '' : ', 中文职务') +
				(this.data.record.position.en ? '' : ', 英文职务');
		}
		errorMsg +=
			(this.data.record.phone ? '' : ', 手机') +
			(this.data.record.email ? '' : ', 邮箱地址') +
			(this.data.record.company?.name?.zh ? '' : ', 中文公司名称') +
			(this.data.record.company?.name?.en ? '' : ', 英文公司名称') +
			(this.data.record.company?.address?.zh ? '' : ', 中文详细地址') +
			(this.data.record.company?.address?.en ? '' : ', 英文详细地址') +
			(this.data.record.company?.phone ? '' : ', 座机') +
			(this.data.record.company?.fax ? '' : ', 传真') +
			(this.data.record.company?.country_code ? '' : ', 国家') +
			(this.data.record.company?.region_id ? '' : ', 地区');
		if (!errorMsg) {
			return true;
		} else {
			this.msgSrv.error(`请填写必填项(${errorMsg.slice(2)})，无法认证`);
			return false;
		}
	}

	beforeVerify(requireSave: boolean = false) {
		if (requireSave) {
			const promise1 = new Promise((resolve) => {
				this.save(resolve);
			});
			const promise2 = this.editPhone
				? new Promise((resolve) => {
						this.savePhone(resolve);
				  })
				: null;
			const promise3 = this.editEmail
				? new Promise((resolve) => {
						this.saveEmail(resolve);
				  })
				: null;
			return Promise.all([promise1, promise2, promise3]);
		} else {
			return Promise.all([]);
		}
	}

	openUserTransaction(record: any = {}) {
		console.log(record);
		this.modalHelper
			.create(
				UserTransactionComponent,
				{},
				{
					modalOptions: {
						nzTitle: `${
							record.name?.zh || record.name?.en || '???'
						}-流水`,
						nzComponentParams: {
							user: record,
						},
					},
					size: 1240,
				},
			)
			.subscribe((res) => {});
	}
}
