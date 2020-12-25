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
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { EmailModalComponent } from '@shared';
import { UserViewComponent } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import { WriterTransactionComponent } from '../writer-transaction/writer-transaction.component';

@Component({
	selector: 'app-writer-list',
	templateUrl: './writer-list.component.html',
})
export class WriterListComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		filter: 'writer',
		sorter: '',
		statusList: [],
	};
	total = 0;
	list: any[] = [];
	status = [];
	intention: any[];
	token_f: string;
	loading = false;
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
		this.status = this.comSrv.writerStatus;
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
				title: '姓名',
				index: 'name.zh',
				format: (item, _col) => `${item.name.zh || '-'}`,
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
			{
				title: '专栏名称',
				index: 'writer_name',
				format: (item, _col) =>
					`${item.writer.name.zh || item.writer.name.en || '-'}`,
			},
			{
				title: '认证状态',
				index: 'status_writer',
				render: 'status',
				filter: {
					menus: this.status,
					multiple: false,
				},
			},
			{ title: '申请时间', type: 'date', index: 'writer.created_at' },
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
								text: '发送邮件',
								click: (item: any) =>
									this.openEmailModal(item.email),
							},
							{
								text: '分配稿费',
								click: (item: any) =>
									this.openTransactionModal(item),
							},
						],
					},
				],
			},
		];
	}

	getData() {
		this.loading = true;
		this.queryParams.statusList = this.status
			.filter((w) => w.checked)
			.map((item) => item.index);
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

	download() {
		this.modalSrv.confirm({
			nzTitle: '<strong>是否确定导出搜索结果<strong>',
			nzOnOk: () => {
				this.blkSrv.setBlockStatus(true);
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
							this.blkSrv.setBlockStatus(false);
							const data = [
								[
									'姓名',
									'邮箱',
									'手机号',
									'认证状态',
									'申请时间',
								],
							];
							res.data.list.forEach((element) => {
								data.push([
									element.name ? element.name.zh : '-',
									element.email || '-',
									element.phone || '-',
									this.status[element.status_writer].label,
									element.created_at,
								]);
							});
							this.xlsx.export({
								filename: `媒体投稿会员.xlsx`,
								sheets: [
									{
										data,
										name: '媒体投稿会员',
									},
								],
							});
						},
						(err: HttpErrorResponse) => {
							this.blkSrv.setBlockStatus(false);
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

	openTransactionModal(record: any) {
		if (!record.id) {
			return;
		}
		this.modal
			.create(
				WriterTransactionComponent,
				{ data: { record } },
				{ size: 900 },
			)
			.subscribe((res) => {
				this.getData();
			});
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
			// this.comSrv
			// 	.getRegions({ id: this.queryParams.country.id })
			// 	.subscribe((res: any) => {
			// 		this.regions = res.data.list;
			// 	});
		}
	}
}
