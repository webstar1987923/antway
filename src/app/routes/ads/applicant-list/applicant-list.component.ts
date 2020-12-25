import { HttpErrorResponse } from '@angular/common/http';
import {
	ChangeDetectorRef,
	Component,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
	STChange,
	STColumn,
	STColumnButton,
	STComponent,
	STData,
} from '@delon/abc/st';
import { XlsxService } from '@delon/abc/xlsx';
import { ModalHelper } from '@delon/theme';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';

import * as moment from 'moment';

import { ApplicantViewComponent } from '../applicant-view/applicant-view.component';

@Component({
	selector: 'app-applicant-list',
	templateUrl: './applicant-list.component.html',
})
export class ApplicantListComponent implements OnInit, OnDestroy {
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
	adsSpaces = [];
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[];
	selectedRows: STData[] = [];
	totalCallNo = 0;

	constructor(
		private cdr: ChangeDetectorRef,
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: ModalHelper,
		private modalSrv: NzModalService,
		private msgSrv: NzMessageService,
		private route: ActivatedRoute,
		private xlsx: XlsxService,
	) {}

	ngOnInit() {
		this.status = this.comSrv.adsSpaceApplicantStatus;
		this.refreshColumn();
		if (this.route.snapshot.data.filter) {
			this.queryParams.filter = this.route.snapshot.data.filter;
		}
		this.getData();
		this.getAdsSpaces();
	}

	ngOnDestroy() {}

	refreshColumn() {
		this.columns = [
			{
				title: '公司名称',
				index: 'company',
				format: (item, _col) =>
					`${item.company ? item.company.name.zh : '-'}`,
			},
			{
				title: '参展企业负责人',
				index: 'manager',
				format: (item, _col) =>
					`${item.user ? item.user.name.zh : '-'}`,
			},
			{
				title: '广告位',
				index: 'ads_space',
				format: (item, _col) =>
					`${item.ads_space ? item.ads_space.name : '-'}`,
				filter: {
					menus: this.adsSpaces,
					multiple: false,
				},
			},
			{
				title: '价格',
				index: 'price',
				format: (item, _col) =>
					`${item.ads_space ? item.ads_space.price : '-'}`,
			},
			{
				title: '处理状态',
				index: 'status',
				render: 'status',
				filter: {
					menus: this.status,
				},
			},
			{
				title: '申请时间',
				type: 'date',
				index: 'created_at',
				sort: true,
			},
			{
				title: '操作',
				buttons: [
					{
						text: '查看',
						click: (item: any) => this.openView(item),
					},
					{
						text: '支付明细',
						click: (item: any) => this.openView(item),
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
		this.comSrv.getAdsSpaceApplicants({ ...this.queryParams }).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				console.log('ads applicant list', res);
				this.total = res.data.total;
				this.list = res.data.list;
				this.cdr.detectChanges();
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	getAdsSpaces() {
		this.blkSrv.setBlockStatus(true);
		this.comSrv.getAdsSpaces().subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.adsSpaces = [];
				res.data.list.forEach((element) => {
					this.adsSpaces.push({
						value: element.id,
						text: element.name,
						label: element.name,
						checked: false,
					});
				});
				this.refreshColumn();
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

	fetchChildren(value) {
		value.forEach((element) => {
			element.value = element.id;
			element.label = element.name.zh;
			element.parent = element.pid;
			element.isLeaf = !element.children.length;
			element.children = this.fetchChildren(element.children);
		});
		return value;
	}

	openView(record: any = {}) {
		this.modal
			.create(
				ApplicantViewComponent,
				{ data: { record } },
				{ size: 1000 },
			)
			.subscribe((res) => {
				this.getData();
			});
	}

	reset() {
		// wait form reset updated finished
		setTimeout(() => this.getData());
	}
}
