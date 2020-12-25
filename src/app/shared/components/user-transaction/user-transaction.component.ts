import { HttpErrorResponse } from '@angular/common/http';
import {
	ChangeDetectorRef,
	Component,
	Input,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { STChange, STColumn, STComponent, STData } from '@delon/abc/st';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BlockUIService } from '../../services/block-ui.service';
import { CommonService } from '../../services/common.service';

@Component({
	selector: 'app-user-transaction',
	templateUrl: './user-transaction.component.html',
})
export class UserTransactionComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		active: '',
		direction: '',
	};
	@Input() user;
	total = 0;
	list: any[] = [];
	total_wallet: number;
	loading = false;
	status = [];
	resultStatus: any[] = [];
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{
			title: '申请人姓名',
			index: 'user.name',
			format: (item, _col) =>
				`${item.user?.name?.zh || item.user?.name?.en || '-'}`,
		},
		{ title: '联系方式', index: 'contact' },
		{
			title: '交易方式',
			index: 'channel',
			format: (item, _col) =>
				`${this.comSrv.channelType[item.channel] || '-'}`,
		},
		{ title: '账户', index: 'account', sort: true },
		{
			title: '交易金额',
			index: 'payment_amount',
			format: (item, _col) =>
				`${this.comSrv.currencyType[item.payment_currency] || '-'} ${
					item.payment_amount
				}`,
			sort: true,
		},
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
		// {
		// 	title: '操作',
		// 	buttons: [
		// 		{
		// 			text: '修改处理',
		// 			children: [
		// 				{
		// 					text: '审核中',
		// 					iif: (item: STData) => item.status !== 0,
		// 					click: (item: any) =>
		// 						this.changeStatus(0, '审核中', item),
		// 				},
		// 				{
		// 					text: '通过',
		// 					iif: (item: STData) => item.status !== 1,
		// 					click: (item: any) =>
		// 						this.changeStatus(1, '通过', item),
		// 				},
		// 				{
		// 					text: '未通过',
		// 					iif: (item: STData) => item.status !== 2,
		// 					click: (item: any) =>
		// 						this.changeStatus(2, '未通过', item),
		// 				},
		// 			],
		// 		},
		// 	],
		// },
	];
	selectedRows: STData[] = [];
	totalCallNo = 0;

	constructor(
		private blkSrv: BlockUIService,
		private cdr: ChangeDetectorRef,
		private comSrv: CommonService,
		private msgSrv: NzMessageService,
		private modalSrv: NzModalService,
	) {}

	ngOnInit() {
		this.status = this.comSrv.transactionStatus;
		this.getData();
	}

	ngOnDestroy() {}

	getData() {
		this.loading = true;
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});
		this.comSrv
			.getTransactions({
				...this.queryParams,
				user_id: this.user.id,
			})
			.subscribe(
				(res: any) => {
					this.loading = false;
					this.total = res.data.total;
					this.list = res.data.list;
					this.total_wallet = res.data.total_wallet;
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
}
