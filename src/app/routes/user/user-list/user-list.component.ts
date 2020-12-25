import { HttpErrorResponse } from '@angular/common/http';
import {
	ChangeDetectorRef,
	Component,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { STChange, STColumn, STComponent, STData } from '@delon/abc/st';
import { XlsxService } from '@delon/abc/xlsx';
import { ModalHelper } from '@delon/theme';
import { AuthenticationService } from '@shared';
import { CommonService } from '@shared';
import { EmailModalComponent } from '@shared';
import { MessageModalComponent } from '@shared';
import { UserModalComponent } from '@shared';
import { UserViewComponent } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';

import * as moment from 'moment';

@Component({
	selector: 'app-user-list',
	templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		filter: '',
		sorter: '',
		statusList: [],
	};
	total = 0;
	list: any[] = [];
	loading = false;
	userVerifyStatus = [];
	vipStatus = [];
	intention: any[];
	token_f: string;
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [];
	selectedRows: STData[] = [];
	totalCallNo = 0;
	expandForm = false;
	countries: any[] = [];
	regions: any[] = [];
	mgmodels: any[] = [];
	commonDataSubscription: Subscription;

	constructor(
		private cdr: ChangeDetectorRef,
		private authSrv: AuthenticationService,
		private comSrv: CommonService,
		private modal: ModalHelper,
		private modalSrv: NzModalService,
		private msgSrv: NzMessageService,
		private route: ActivatedRoute,
		private xlsx: XlsxService,
	) {}

	ngOnInit() {
		this.userVerifyStatus = this.comSrv.userVerifyStatus;
		this.vipStatus = this.comSrv.vipStatus;
		this.intention = this.comSrv.intention;
		this.token_f = this.authSrv.getUser().token_f;
		this.commonDataSubscription = this.comSrv
			.getCommonDataUpdates()
			.subscribe((res: any) => {
				this.countries = res.countries;
				this.mgmodels = res.mgmodels;
			});
		if (this.route.snapshot.data.filter) {
			this.queryParams.filter = this.route.snapshot.data.filter;
		}
		this.refreshColumn();
		this.getData();
	}

	ngOnDestroy() {
		this.commonDataSubscription.unsubscribe();
	}

	refreshColumn() {
		this.columns = [
			{ title: '', index: 'id', type: 'checkbox' },
			{
				title: '姓名',
				index: 'name',
				format: (item, _col) =>
					`${item.name.zh || item.name.en || '-'}`,
			},
			{
				title: '邮箱',
				index: 'email',
				format: (item, _col) => `${item.email || '-'}`,
			},
			{
				title: '手机号',
				index: 'phone',
				format: (item, _col) =>
					`${(item.phone_prefix || '') + (item.phone || '-')}`,
			},
			{ title: '公司名称', index: 'company.name.zh', default: '-' },
			{
				title: '认证状态',
				index: 'status_verified',
				render: 'status_verified',
				filter: {
					menus: this.userVerifyStatus,
					multiple: false,
				},
				iif: (item: STData) => this.queryParams.filter !== 'verified',
			},
			{
				title: 'VIP状态',
				index: 'vip_status',
				render: 'vip_status',
				filter: {
					menus: this.vipStatus,
					multiple: false,
				},
				iif: (item: STData) => this.queryParams.filter !== 'vip',
			},
			{
				title: '文具通状态',
				index: 'stationery_status',
				render: 'stationery_status',
				filter: {
					menus: this.vipStatus,
					multiple: false,
				},
			},
			{ title: '注册时间', type: 'date', index: 'created_at' },
			{
				title: '操作',
				buttons: [
					{
						text: '查看',
						click: (item: any) => this.openUserView(item),
					},
					{
						text: '跳转',
						click: (item: any) => {
							window.open(
								`http://www.antway.cn/admin-login?token=${this.token_f}&user=${item.id}&redirect=profile`,
								'_blank',
							);
						},
					},
					{
						text: '更多',
						children: [
							{
								text: '重置密码',
								click: (item: any) =>
									this.openUserModal(item, 'resetPassword'),
							},
							{
								text: '发送邮件',
								click: (item: any) =>
									this.openEmailModal(item.email),
							},
							{
								text: '发送消息',
								click: (item: any) =>
									this.openMessageModal(item),
							},
						],
					},
				],
			},
		];
	}

	getData() {
		this.loading = true;
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});

		this.comSrv
			.getUsers({
				...this.queryParams,
			})
			.subscribe(
				(res: any) => {
					this.loading = false;
					this.total = res.data.total;
					this.list = res.data.list;
					this.cdr.detectChanges();
				},
				(err: HttpErrorResponse) => {
					this.loading = false;
				},
			);
	}

	stChange(e: STChange) {
		switch (e.type) {
			case 'checkbox':
				this.selectedRows = e.checkbox;
				this.totalCallNo = this.selectedRows.reduce(
					(total, cv) => total + cv.callNo,
					0,
				);
				this.cdr.detectChanges();
				break;
			case 'filter':
				this.queryParams[e.filter.indexKey] = e.filter.filter.menus
					.filter((w) => w.checked)
					.map((item) => item.value)
					.join(',');
				this.getData();
				break;
			case 'pi':
				this.queryParams.pi = e.pi;
				this.getData();
				break;
			case 'ps':
				this.queryParams.ps = e.ps;
				this.getData();
				break;
		}
	}

	remove(id?) {
		const ids = id ? id : this.selectedRows.map((i) => i.id).join(',');
		if (ids) {
			this.modalSrv.confirm({
				nzTitle: '<strong>是否确定删除<strong>',
				nzContent: '删除后就无法挽回咯~',
				nzOkType: 'danger',
				nzOnOk: () => {
					this.loading = true;
					this.comSrv.deleteUser(ids).subscribe(
						() => {
							this.loading = false;
							this.getData();
							this.st.clearCheck();
						},
						(err: HttpErrorResponse) => {
							this.loading = false;
						},
					);
				},
			});
		} else {
			this.msgSrv.info('选择');
		}
	}

	download() {
		this.modalSrv.confirm({
			nzTitle: '<strong>是否确定导出搜索结果<strong>',
			nzOnOk: () => {
				this.loading = true;
				this.comSrv
					.getUsers({
						...this.queryParams,
						country: this.queryParams.country
							? this.queryParams.country.code
							: '',
						pi: '',
						ps: '',
					})
					.subscribe(
						(res: any) => {
							this.loading = false;
							const data = [
								[
									'姓名',
									'邮箱',
									'手机号',
									'公司名称',
									'状态',
									'到期时间',
								],
							];
							res.data.list.forEach((element) => {
								element.status = 0;
								if (element.status_verified === 2) {
									if (element.stationery) {
										element.status = 4;
									} else if (element.vip) {
										element.status = 3;
									} else {
										element.status = 1;
									}
								}
								data.push([
									element.name ? element.name.zh : '-',
									element.email || '-',
									element.phone || '-',
									element.company && element.company.name
										? element.company.name.zh
										: '-',
									this.userVerifyStatus[element.status].text,
									element.created_at,
								]);
							});
							this.xlsx.export({
								filename: `用户.xlsx`,
								sheets: [
									{
										data,
										name: '用户',
									},
								],
							});
						},
						(err: HttpErrorResponse) => {
							this.loading = false;
						},
					);
			},
		});
	}

	openUserView(record: any = {}) {
		this.modal
			.create(
				UserViewComponent,
				{ data: { record } },
				{ size: 1240, includeTabs: true },
			)
			.subscribe((res) => {
				this.getData();
			});
	}

	openUserModal(record: any = {}, action: string = '') {
		this.modal
			.create(
				UserModalComponent,
				{ data: { record, action } },
				{ size: 'md' },
			)
			.subscribe((res) => {
				this.getData();
			});
	}

	openEmailModal(email: string = '') {
		const emails = email
			? email
			: this.selectedRows.map((i) => i.email).join(',');
		this.modal
			.create(
				EmailModalComponent,
				{ data: { record: { to: emails } } },
				{ size: 900 },
			)
			.subscribe((res) => {
				this.getData();
				this.cdr.detectChanges();
			});
	}

	openMessageModal(item: any = {}) {
		const users = item.id ? [item] : this.selectedRows.map((i) => i);
		if (users.length) {
			this.modal
				.create(
					MessageModalComponent,
					{ data: { users } },
					{ size: 900 },
				)
				.subscribe((res) => {
					this.getData();
					this.cdr.detectChanges();
				});
		} else {
			this.msgSrv.info('选择');
		}
	}

	reset() {
		// wait form reset updated finished
		setTimeout(() => this.getData());
	}

	selectCountry() {
		if (this.queryParams.country) {
			this.queryParams.region = null;
			if (this.queryParams.country === 'CHN') {
				this.regions = this.comSrv.getCommonData().chinaRegions;
			} else {
				this.regions = [];
			}
			// console.log('Selected country:', this.queryParams.country);
			// this.comSrv
			// 	.getRegions({ id: this.queryParams.country.id })
			// 	.subscribe((res: any) => {
			// 		this.regions = res.data.list;
			// 		console.log('regions:', res.data);
			// 	});
		}
	}

	// downloadTemplate() {
	// 	const data = [
	// 		[
	// 			'中文姓名',
	// 			'英文姓名',
	// 			'中文称呼(先生, 女士, 小姐)',
	// 			'英文称呼(Mr., Mrs., Ms., Miss)',
	// 			'中文职务',
	// 			'英文职务',
	// 			'手机',
	// 			'邮箱地址',
	// 			'微信',
	// 			'QQ',
	// 			'VIP到期时间',
	// 			'中文公司名称',
	// 			'英文公司名称',
	// 			'中文详细地址',
	// 			'英文详细地址',
	// 			'座机',
	// 			'传真',
	// 			'国家',
	// 			'城市',
	// 			'地区',
	// 			'邮编',
	// 			'经营性质',
	// 			'公司网址',
	// 			'文具通到期时间',
	// 		],
	// 		[
	// 			'符运中',
	// 			'yunzhong fu',
	// 			'先生',
	// 			'Mr',
	// 			'经理',
	// 			'manager',
	// 			'13623762476',
	// 			'example@example.com',
	// 			'11212344213',
	// 			'467216017',
	// 			'2020/09/23',
	// 			'广州展昭国际展览有限公司',
	// 			'Guangzhou Zhanzhao International Exhibition Co., Ltd',
	// 			'广州市天河区建中路26号',
	// 			'26 Jianzhong Road, Tianhe District, Guangzhou',
	// 			'123-123-123',
	// 			'123-123-123',
	// 			'中国',
	// 			'北京市',
	// 			'市辖区',
	// 			'12321',
	// 			'生产代工型',
	// 			'www.expo.com',
	// 			'2020/09/23',
	// 		],
	// 	];

	// 	this.xlsx.export({
	// 		filename: `批量导入模板.xlsx`,
	// 		sheets: [
	// 			{
	// 				data,
	// 				name: '批量导入模板',
	// 			},
	// 		],
	// 	});
	// }

	// beforeUploadFile = (file: any): boolean => {
	// 	this.xlsx.import(file).then((rawData: any) => {
	// 		const userList = [];
	// 		let originData;
	// 		for (const key in rawData) {
	// 			if (Object.prototype.hasOwnProperty.call(rawData, key)) {
	// 				originData = rawData[key];
	// 				if (originData && originData.length) {
	// 					originData.forEach((element, idx) => {
	// 						// Skip first row that is column name
	// 						if (idx) {
	// 							userList.push({
	// 								index: idx,
	// 								name_zh: element[0],
	// 								name_en: element[1],
	// 								gender_zh: element[2],
	// 								gender_en: element[3],
	// 								position_zh: element[4],
	// 								position_en: element[5],
	// 								phone_prefix: '86',
	// 								phone: element[6],
	// 								email: element[7],
	// 								wechat: element[8],
	// 								qq: element[9],
	// 								vip_todate:
	// 									new Date(element[10]).getTime() /
	// 										1000 || 0,
	// 								company: {
	// 									name_zh: element[11],
	// 									name_en: element[12],
	// 									address_zh: element[13],
	// 									address_en: element[14],
	// 									phone: '86-' + element[15],
	// 									fax: '86-' + element[16],
	// 									country: element[17],
	// 									city: element[18],
	// 									region: element[19],
	// 									postal: element[20],
	// 									mgmodel: element[21],
	// 									website: element[22],
	// 									stationery_todate:
	// 										new Date(element[23]).getTime() /
	// 											1000 || 0,
	// 								},
	// 							});
	// 						}
	// 					});
	// 					break;
	// 				}
	// 			}
	// 		}

	// 		this.modalSrv.confirm({
	// 			nzTitle: '<strong>是否确定批量导入<strong>',
	// 			nzOkType: 'primary',
	// 			nzOnOk: () => {
	// 				this.loading = true;
	// 				this.comSrv
	// 					.importUsers({ data: JSON.stringify(userList) })
	// 					.subscribe(
	// 						(res: any) => {
	// 							this.loading = false;
	// 							this.msgSrv.success(res.data.msg);
	// 							this.getData();
	// 						},
	// 						(err: HttpErrorResponse) => {
	// 							this.loading = false;
	// 							this.downloadErrorList(
	// 								originData,
	// 								err.error.data.result,
	// 							);
	// 							this.getData();
	// 						},
	// 					);
	// 			},
	// 		});
	// 	});
	// 	return false;
	// };

	// downloadErrorList(originData, errorData) {
	// 	const data: any[] = [];
	// 	const error: any[] = [];
	// 	data.push(originData[0]);
	// 	error.push(['现在行', '原版的行', '姓名', '失败']);
	// 	errorData.forEach((element, idx) => {
	// 		data.push(originData[element.index]);
	// 		error.push([
	// 			idx + 2,
	// 			element.index + 1,
	// 			originData[element.index][0] || '-',
	// 			element.error,
	// 		]);
	// 	});
	// 	const filename =
	// 		moment().format('YYYY-MM-DD-HH-mm-ss-') + `批量导入失败.xlsx`;
	// 	this.xlsx.export({
	// 		filename,
	// 		sheets: [
	// 			{
	// 				data,
	// 				name: '批量导入数据',
	// 			},
	// 			{
	// 				data: error,
	// 				name: '失败',
	// 			},
	// 		],
	// 	});
	// 	this.modalSrv.info({
	// 		nzTitle: `<strong>检查${filename}<strong>`,
	// 	});
	// }
}
