import { HttpErrorResponse } from '@angular/common/http';
import {
	ChangeDetectorRef,
	Component,
	Input,
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
import { ModalHelper } from '@delon/theme';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import * as _ from 'underscore';

import { TransactionType } from '@shared';

import { UserTransactionComponent } from '@shared';

@Component({
	selector: 'app-transaction-list',
	templateUrl: './transaction-list.component.html',
})
export class TransactionListComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		type: TransactionType.WITHDRAW,
		active: '',
		direction: '',
	};
	data: any = {};
	total = 0;
	list: any[] = [];
	status = [];
	loading = false;
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
	) {}

	ngOnInit() {
		this.status = this.comSrv.transactionStatus;
		this.refreshColumn();
		this.getData();
	}

	ngOnDestroy() {}

	refreshColumn() {
		this.columns = [
			{
				title: '申请人姓名',
				index: 'user.name',
				render: 'user-transaction',
				format: (item, _col) =>
					`${item.user?.name?.zh || item.user?.name?.en || '-'}`,
			},
			{ title: '联系方式', index: 'contact' },
			{
				title: '提现方式',
				index: 'channel',
				format: (item, _col) =>
					`${this.comSrv.channelType[item.channel] || '-'}`,
			},
			{ title: '提现账户', index: 'account', sort: true },
			{ title: '提现金额', index: 'amount', sort: true },
			{
				title: '处理状态',
				index: 'status',
				render: 'status',
				filter: {
					menus: this.status,
					multiple: false,
				},
			},
			{
				title: '申请时间',
				index: 'created_at',
				type: 'date',
				sort: true,
			},
			{
				title: '处理时间',
				index: 'processed_at',
				type: 'date',
				sort: true,
			},
			{
				title: '操作',
				buttons: [
					{
						text: '修改处理',
						children: [
							{
								text: '审核中',
								iif: (item: STData) => item.status !== 0,
								click: (item: any) =>
									this.changeStatus(0, '审核中', item),
							},
							{
								text: '通过',
								iif: (item: STData) => item.status !== 1,
								click: (item: any) =>
									this.changeStatus(1, '通过', item),
							},
							{
								text: '未通过',
								iif: (item: STData) => item.status !== 2,
								click: (item: any) =>
									this.changeStatus(2, '未通过', item),
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
			.getTransactions({
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
			case 'sort':
				this.queryParams.active = e.sort.column.indexKey || '';
				this.queryParams.direction = e.sort.value || '';
				this.getData();
				break;
		}
	}

	changeStatus(status, text, item?) {
		const ids = item
			? item.id
			: this.selectedRows.map((i) => i.id).join(',');
		if (ids) {
			this.modalSrv.confirm({
				nzTitle: `<strong>是否确定${text}<strong>`,
				nzOkType: 'danger',
				nzOnOk: () => {
					this.loading = true;
					this.comSrv
						.changeTransactionStatus({ ids, status })
						.subscribe(() => {
							this.loading = false;
							this.getData();
						});
				},
			});
		} else {
			this.msgSrv.info('选择');
		}
	}

	openUserTransaction(record: any = {}) {
		this.modal
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
			.subscribe((res) => {
				this.getData();
				this.cdr.detectChanges();
			});
	}

	reset() {
		// wait form reset updated finished
		setTimeout(() => this.getData());
	}
}
