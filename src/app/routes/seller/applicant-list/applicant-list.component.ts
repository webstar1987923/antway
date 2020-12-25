import { HttpErrorResponse } from '@angular/common/http';
import {
	ChangeDetectorRef,
	Component,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Delon
import {
	STChange,
	STColumn,
	STColumnButton,
	STComponent,
	STData,
} from '@delon/abc/st';
import { XlsxService } from '@delon/abc/xlsx';
import { ACLService } from '@delon/acl';
import { ModalHelper } from '@delon/theme';

// Zorro
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

// Constants
import { RoleCst } from '@shared';

// Custom services
import { AuthenticationService } from '@shared';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';

// Plugins
import * as moment from 'moment';
import * as _ from 'underscore';

// Components
import { ExpoSelectComponent } from '@shared';
import { SellerViewComponent } from '@shared';
import { ApplicantAdminBindingComponent } from '../applicant-admin-binding/applicant-admin-binding.component';

@Component({
	selector: 'app-applicant-list',
	templateUrl: './applicant-list.component.html',
})
export class ApplicantListComponent implements OnInit, OnDestroy {
	readonly RoleCst = RoleCst;

	queryParams: any = {
		pi: 1,
		ps: 10,
		filter: '',
		active: '',
		direction: '',
	};
	total = 0;
	list: any[] = [];
	loading = false;
	status = [];
	expoes = [];
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[];
	selectedRows: STData[] = [];
	totalCallNo = 0;
	token_f: string;

	constructor(
		private cdr: ChangeDetectorRef,
		private authSrv: AuthenticationService,
		private aclSrv: ACLService,
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: ModalHelper,
		private modalSrv: NzModalService,
		private msgSrv: NzMessageService,
		private route: ActivatedRoute,
		private xlsx: XlsxService,
	) {}

	ngOnInit() {
		this.status = this.comSrv.expoSellerChecked;
		this.token_f = this.authSrv.getUser().token_f;
		this.expoes = this.comSrv.getCommonData().expoes;
		this.refreshColumn();
		if (this.route.snapshot.data.filter) {
			this.queryParams.filter = this.route.snapshot.data.filter;
		}
		this.getData();
	}

	ngOnDestroy() {}

	refreshColumn() {
		this.columns = [
			{
				title: '举办名称',
				index: 'expo',
				format: (item, _col) =>
					`${item.expo ? item.expo.name.zh : '-'}`,
				filter: {
					menus: this.expoes,
					multiple: false,
				},
			},
			{
				title: '入住企业名称',
				index: 'company',
				render: 'company_link',
			},
			{
				title: '参展企业负责人',
				index: 'manager',
				format: (item, _col) =>
					`${item.company ? item.company.manager.name.zh : '-'}`,
			},
			{
				title: '对接业务员',
				index: 'admin',
				format: (item, _col) =>
					`${item.admin ? item.admin.user_name : '-'}`,
			},
			{
				title: '申请时间',
				type: 'date',
				index: 'created_at',
				sort: true,
			},
			{
				title: '处理状态',
				index: 'admin_checked',
				render: 'status',
				filter: {
					menus: this.status,
				},
			},
			{
				title: '操作',
				buttons: [
					{
						text: '详情',
						click: (item: any) => this.openView(item),
					},
					{
						text: '跳转',
						click: (item: any) => {
							window.open(
								`http://www.antway.cn/admin-login?token=${this.token_f}&user=${item.user_id}&redirect=profile/seller/applicant`,
								'_blank',
							);
						},
					},
					{
						text: '更多',
						iif: (item: STData) =>
							this.aclSrv.canAbility(item.expo.admin_id) ||
							this.aclSrv.can(RoleCst.SUPER),
						children: [
							{
								text: '分配业务员',
								click: (item: any) =>
									this.openAdminBinding(item),
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
		this.comSrv.getExpoApplicantSellers({ ...this.queryParams }).subscribe(
			(res: any) => {
				this.loading = false;
				console.log('applicant seller list', res);
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
				nzOkType: 'danger',
				nzOnOk: () => {
					this.loading = true;
					this.comSrv.deleteProduct(ids).subscribe(
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

	restore(id?) {
		const ids = id ? id : this.selectedRows.map((i) => i.id).join(',');
		if (ids) {
			this.modalSrv.confirm({
				nzTitle: '<strong>是否确定恢复<strong>',
				nzOkType: 'danger',
				nzOnOk: () => {
					this.loading = true;
					this.comSrv.restoreProduct(ids).subscribe(
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
			this.msgSrv.error(`选择`, { nzDuration: 1000 * 3 });
		}
	}

	openView(record: any = {}) {
		this.modal
			.create(SellerViewComponent, { data: { record } }, { size: 1000 })
			.subscribe((res) => {
				this.getData();
			});
	}

	openAdminBinding(record: any = {}) {
		this.modal
			.create(
				ApplicantAdminBindingComponent,
				{ data: { record } },
				{ size: 1240, includeTabs: true },
			)
			.subscribe((res) => {
				this.getData();
			});
	}

	reset() {
		// wait form reset updated finished
		setTimeout(() => this.getData());
	}

	download() {
		this.modalSrv.confirm({
			nzTitle: '<strong>是否确定导出搜索结果<strong>',
			nzOnOk: () => {
				this.loading = true;
				this.comSrv
					.getExpoApplicantSellers({
						...this.queryParams,
						pi: '',
						ps: '',
					})
					.subscribe(
						(res: any) => {
							this.loading = false;
							const data = [
								[
									'举办名称',
									'入住企业名称',
									'参展企业负责人',
									'对接业务员',
									'申请时间',
									'处理状态',
									'参展展位',
									'展位总价格',
									'支付状态',
								],
							];
							res.data.list.forEach((element) => {
								data.push([
									element.expo && element.expo.name
										? element.expo.name.zh
										: '-',
									element.company && element.company.name
										? element.company.name.zh
										: '-',
									element.company && element.company.manager
										? element.company.manager.name.zh
										: '-',
									element.admin
										? element.admin.user_name
										: '-',
									moment(element.created_at).format(
										'YYYY/MM/DD HH:mm:ss',
									),
									this.status[element.admin_checked || 0]
										.text,
									_.pluck(element.halls, 'map_id').join(','),
									element.amount || '',
									element.transaction
										? moment(
												element.transaction
													.processed_at,
										  ).format('YYYY/MM/DD HH:mm:ss')
										: '未支付',
								]);
							});
							this.xlsx.export({
								filename: `参展.xlsx`,
								sheets: [
									{
										data,
										name: '参展',
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

	downloadTemplate() {
		const data = [
			[
				'入住企业名称',
				'展会负责人姓名',
				'展会负责人称呼(先生, 夫人, 女士, 小姐)',
				'展会负责人手机号',
				'展会负责人职务',
				'参展展位',
				'展位类型',
				'特装面积',
				'展位总价格',
				'对接业务员',
			],
			[
				'温州博为文具有限公司',
				'符运中',
				'先生',
				'13623762476',
				'经理',
				'h1-001,h1-002,h1-003',
				'标准展位',
				'10',
				'3000',
				'heartbeat0415',
			],
		];

		this.xlsx.export({
			filename: `参展数据批量导入模板.xlsx`,
			sheets: [
				{
					data,
					name: '参展数据批量导入模板',
				},
			],
		});
	}

	beforeUploadFile = (file: any): boolean => {
		this.xlsx.import(file).then((rawData: any) => {
			const dataList = [];
			let originData;
			for (const key in rawData) {
				if (Object.prototype.hasOwnProperty.call(rawData, key)) {
					originData = rawData[key];
					if (originData && originData.length) {
						originData.forEach((element, idx) => {
							// Skip first row that is column name and blank rows
							if (idx && element && element.length) {
								let index = 0;
								dataList.push({
									index: idx,
									company_name: element[index++],
									leader_name: element[index++],
									leader_gender:
										this.comSrv.gender_zh_dict[
											element[index++]
										] || 0,
									leader_phone: element[index++],
									leader_position: element[index++],
									halls: element[index++],
									area_type: element[index++],
									area: element[index++],
									amount: element[index++],
									admin: element[index++],
								});
							}
						});
						break;
					}
				}
			}

			this.modal
				.create(ExpoSelectComponent, { data: {} }, { size: 'md' })
				.subscribe((response) => {
					this.blkSrv.setBlockStatus(true);
					this.comSrv
						.importExpoApplicantSellers({
							expo_id: response.expo_id,
							data: JSON.stringify(dataList),
						})
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
				});
		});
		return false;
	};

	downloadErrorList(originData, errorData) {
		const data: any[] = [];
		const error: any[] = [];
		data.push(originData[0]);
		error.push(['现在行', '原版的行', '入住企业名称', '失败']);
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
			moment().format('YYYY-MM-DD-HH-mm-ss-') +
			`参展数据批量导入失败.xlsx`;
		this.xlsx.export({
			filename,
			sheets: [
				{
					data,
					name: '参展数据批量导入数据',
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
