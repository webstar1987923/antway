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
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';

import * as moment from 'moment';

import { AuthenticationService } from '@shared';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';

import { EmailModalComponent } from '@shared';
import { MessageModalComponent } from '@shared';
import { UserModalComponent } from '@shared';
import { UserViewComponent } from '@shared';
import { MemberBindingComponent } from '@shared';

@Component({
	selector: 'app-stationery-list',
	templateUrl: './stationery-list.component.html',
})
export class StationeryListComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		filter: 'stationery',
		active: '',
		direction: '',
	};
	total = 0;
	list: any[] = [];
	loading = false;
	userVerifyStatus = [];
	vipStatus = [];
	companyVerifyStatus = [];
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
		private blkSrv: BlockUIService,
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
		this.companyVerifyStatus = this.comSrv.companyVerifyStatus;
		this.intention = this.comSrv.intention;
		this.token_f = this.authSrv.getUser().token_f;
		this.commonDataSubscription = this.comSrv
			.getCommonDataUpdates()
			.subscribe((res: any) => {
				this.countries = res.countries;
				this.mgmodels = res.mgmodels;
			});
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
				title: '公司负责人',
				index: 'name.zh',
				format: (item, _col) => `${item.manager?.name?.zh || '-'}`,
			},
			{
				title: '邮箱',
				index: 'email',
				format: (item, _col) => `${item.manager?.email || '-'}`,
			},
			{
				title: '手机号',
				index: 'phone',
				format: (item, _col) =>
					`${
						(item.manager?.phone_prefix || '') +
						(item.manager?.phone || '-')
					}`,
			},
			{
				title: '公司名称',
				index: 'name.zh',
				render: 'company_link',
			},
			{
				title: '参展次数',
				index: 'count_expos',
				default: '0',
				sort: true,
			},
			{
				title: '到期时间',
				type: 'date',
				index: 'todate',
				sort: true,
				format: (item, _col) => `${item.stationerylog?.todate}`,
			},
			{
				title: '认证状态',
				index: 'status_verified',
				render: 'status_verified',
				filter: {
					menus: this.userVerifyStatus,
					multiple: false,
				},
			},
			{
				title: 'VIP状态',
				index: 'vip_status',
				render: 'vip_status',
				filter: {
					menus: this.vipStatus,
					multiple: false,
				},
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
			{
				title: '企业认证',
				index: 'status',
				render: 'status',
				filter: {
					menus: this.companyVerifyStatus,
					multiple: false,
				},
			},
			{
				title: '操作',
				buttons: [
					{
						text: '查看',
						click: (item: any) =>
							this.openStationeryView(item.manager),
					},
					{
						text: '跳转',
						click: (item: any) => {
							window.open(
								`http://www.antway.cn/admin-login?token=${this.token_f}&user=${item.manager.id}&redirect=profile`,
								'_blank',
							);
						},
					},
					{
						text: '更多',
						children: [
							{
								text: '新增会员',
								click: (item: any) => this.openUserModal(item),
							},
							{
								text: '绑定会员',
								click: (item: any) =>
									this.openMemberBinding(item),
							},
							{
								text: '发送邮件',
								click: (item: any) =>
									this.openEmailModal(item.manager?.email),
							},
							{
								text: '发送消息',
								click: (item: any) =>
									this.openMessageModal(item.manager),
							},
						],
					},
				],
			},
		];
	}

	getData() {
		this.blkSrv.setBlockStatus(true);
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});

		this.comSrv
			.getCompanies({
				...this.queryParams,
			})
			.subscribe(
				(res: any) => {
					this.blkSrv.setBlockStatus(false);
					this.total = res.data.total;
					this.list = res.data.list;
					this.cdr.detectChanges();
				},
				(err: HttpErrorResponse) => {
					this.blkSrv.setBlockStatus(false);
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
			case 'sort':
				this.queryParams.active = e.sort.column.indexKey || '';
				this.queryParams.direction = e.sort.value || '';
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
					this.blkSrv.setBlockStatus(true);
					this.comSrv.deleteUser(ids).subscribe(
						() => {
							this.blkSrv.setBlockStatus(false);
							this.getData();
							this.st.clearCheck();
						},
						(err: HttpErrorResponse) => {
							this.blkSrv.setBlockStatus(false);
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
				this.blkSrv.setBlockStatus(true);
				this.comSrv
					.getCompanies({
						...this.queryParams,
						country: this.queryParams.country
							? this.queryParams.country.code
							: '',
						pi: '',
						ps: '',
					})
					.subscribe(
						(res: any) => {
							this.blkSrv.setBlockStatus(false);
							const data = [
								[
									'负责人中文姓名',
									'负责人英文姓名',
									'负责人称呼',
									'负责人中文职务',
									'负责人英文职务',
									'负责人邮箱地址',
									'微信',
									'QQ',
									'VIP到期时间',
									'负责人手机号',
									'中文公司名称',
									'英文公司名称',
									'中文详细地址',
									'英文详细地址',
									'座机',
									'传真',
									'国家',
									'地区',
									'城市',
									'邮编',
									'经营性质',
									'二级域名',
									'公司网址',
									'参展次数',
									'到期时间',
									'认证状态',
									'VIP状态',
									'文具通状态',
									'企业认证',
								],
							];
							res.data.list.forEach((element) => {
								data.push([
									element.manager?.name?.zh || '-',
									element.manager?.name?.en || '-',
									this.comSrv.gender_zh_dict[
										element.manager?.gender || 0
									],
									element.manager?.position?.zh || '-',
									element.manager?.position?.en || '-',
									element.manager?.email || '-',
									element.manager?.phone || '-',
									element.manager?.wechat || '-',
									element.manager?.qq || '-',
									element.manager?.viplog?.todate || '-',
									element.name?.zh || '-',
									element.name?.en || '-',
									element.address?.zh || '-',
									element.address?.en || '-',
									element.phone || '-',
									element.fax || '-',
									element.country?.name || '-',
									element.region?.name || '-',
									element.city?.name || '-',
									element.postal || '-',
									element.mgmodel?.name?.zh || '',
									element.second_domain || '',
									element.website || '',
									element.count_expos || '0',
									element.stationerylog?.todate || '-',
									this.userVerifyStatus[
										element.manager?.status_verified || 0
									].text,
									this.vipStatus[element.viplog?.status || 0]
										.text,
									this.vipStatus[
										element.stationerylog?.status || 0
									].text,
									this.companyVerifyStatus[
										element.status || 0
									].text,
								]);
							});
							this.xlsx.export({
								filename: `文具通会员.xlsx`,
								sheets: [
									{
										data,
										name: '文具通会员',
									},
								],
							});
							this.cdr.detectChanges();
						},
						(err: HttpErrorResponse) => {
							this.blkSrv.setBlockStatus(false);
						},
					);
			},
		});
	}

	openStationeryView(record: any = {}) {
		this.modal
			.create(
				UserViewComponent,
				{ data: { record, isStationery: true } },
				{ size: 1240, includeTabs: true },
			)
			.subscribe((res) => {
				this.getData();
			});
	}

	openUserModal(company: any = {}) {
		this.modal
			.create(
				UserModalComponent,
				{ data: { record: {}, company_id: company.id } },
				{ size: 'md' },
			)
			.subscribe((res) => {
				this.getData();
			});
	}

	openMemberBinding(company: any = {}) {
		this.modal
			.create(
				MemberBindingComponent,
				{
					data: {
						record: company,
					},
				},
				{ size: 'md' },
			)
			.subscribe(() => {
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
			// this.blkSrv.setBlockStatus(true);
			// this.comSrv
			// 	.getRegions({ id: this.queryParams.country.id })
			// 	.subscribe(
			// 		(res: any) => {
			// 			this.blkSrv.setBlockStatus(false);
			// 			this.regions = res.data.list;
			// 		},
			// 		(err: HttpErrorResponse) => {
			// 			this.blkSrv.setBlockStatus(false);
			// 		},
			// 	);
		}
	}

	downloadTemplate() {
		const data = [
			[
				'中文姓名',
				'英文姓名',
				'称呼(先生, 夫人, 女士, 小姐)',
				'中文职务',
				'英文职务',
				'手机',
				'邮箱地址',
				'微信',
				'QQ',
				'VIP到期时间',
				'中文公司名称',
				'英文公司名称',
				'中文详细地址',
				'英文详细地址',
				'座机',
				'传真',
				'国家',
				'地区',
				'城市',
				'邮编',
				'经营性质',
				'公司网址',
				'文具通到期时间',
			],
			[
				'符运中',
				'yunzhong fu',
				'先生',
				'经理',
				'manager',
				'13623762476',
				'example@example.com',
				'11212344213',
				'467216017',
				'2020/09/23',
				'广州展昭国际展览有限公司',
				'Guangzhou Zhanzhao International Exhibition Co., Ltd',
				'广州市天河区建中路26号',
				'26 Jianzhong Road, Tianhe District, Guangzhou',
				'123-123-123',
				'123-123-123',
				'中国',
				'北京市',
				'东城区',
				'12321',
				'生产代工型',
				'www.expo.com',
				'2020/09/23',
			],
		];

		this.xlsx.export({
			filename: `批量导入模板.xlsx`,
			sheets: [
				{
					data,
					name: '批量导入模板',
				},
			],
		});
	}

	beforeUploadFile = (file: any): boolean => {
		this.xlsx.import(file).then((rawData: any) => {
			const userList = [];
			let originData;
			for (const key in rawData) {
				if (Object.prototype.hasOwnProperty.call(rawData, key)) {
					originData = rawData[key];
					if (originData && originData.length) {
						originData.forEach((element, idx) => {
							// Skip first row that is column name and blank rows
							if (idx && element && element.length) {
								let index = 0;
								// Convert date
								element[9] = this.comSrv.excel2Date(element[9]);
								element[22] = this.comSrv.excel2Date(
									element[22],
								);
								userList.push({
									index: idx,
									name_zh: element[index] || 'null',
									name_en: element[++index] || 'null',
									gender:
										this.comSrv.gender_zh_dict[
											element[++index]
										] || 0,
									position_zh: element[++index],
									position_en: element[++index],
									phone_prefix: '86',
									phone: element[++index],
									email: element[++index],
									wechat: element[++index],
									qq: element[++index],
									vip_todate: element[++index],
									company: {
										name_zh: element[++index] || 'null',
										name_en: element[++index] || 'null',
										address_zh: element[++index],
										address_en: element[++index],
										phone: element[++index]
											? '86-' + element[index]
											: null,
										fax: element[++index]
											? '86-' + element[index]
											: null,
										country: element[++index],
										region: element[++index],
										city: element[++index],
										postal: element[++index],
										mgmodel: element[++index],
										website: element[++index],
										stationery_todate: element[++index],
									},
								});
							}
						});
						break;
					}
				}
			}

			this.modalSrv.confirm({
				nzTitle: '<strong>是否确定批量导入<strong>',
				nzOkType: 'primary',
				nzOnOk: () => {
					this.blkSrv.setBlockStatus(true);
					this.comSrv
						.importUsers({ data: JSON.stringify(userList) })
						.subscribe(
							(res: any) => {
								this.blkSrv.setBlockStatus(false);
								this.msgSrv.success(res.data.msg);
								this.getData();
							},
							(err: HttpErrorResponse) => {
								this.blkSrv.setBlockStatus(false);
								this.downloadErrorList(
									originData,
									err.error.data.result,
								);
								this.getData();
							},
						);
				},
			});
		});
		return false;
	};

	downloadErrorList(originData, errorData) {
		const data: any[] = [];
		const error: any[] = [];
		data.push(originData[0]);
		error.push(['现在行', '原版的行', '姓名', '失败']);
		errorData.forEach((element, idx) => {
			data.push(originData[element.index]);
			error.push([
				idx + 2,
				element.index + 1,
				originData[element.index][0] || '-',
				element.error,
			]);
		});
		const filename =
			moment().format('YYYY-MM-DD-HH-mm-ss-') + `批量导入失败.xlsx`;
		this.xlsx.export({
			filename,
			sheets: [
				{
					data,
					name: '批量导入数据',
				},
				{
					data: error,
					name: '失败',
				},
			],
		});
		this.modalSrv.info({
			nzTitle: `<strong>检查${filename}<strong>`,
		});
	}
}
