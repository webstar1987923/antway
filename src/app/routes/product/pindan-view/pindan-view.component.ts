import { HttpErrorResponse } from '@angular/common/http';
import {
	ChangeDetectorRef,
	Component,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { STChange, STColumn, STComponent, STData } from '@delon/abc/st';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-pindan-view',
	templateUrl: './pindan-view.component.html',
	styleUrls: ['./pindan-view.component.less'],
})
export class PindanViewComponent implements OnInit, OnDestroy {
	loading = false;
	data: any = {};
	status: any[] = [];
	isOpenContentModal = false;
	isOpenAddressModal = false;
	selectedPindan: any = {};

	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{
			title: '入住企业名称',
			index: 'company',
			format: (item, _col) =>
				`${item.user.company ? item.user.company.name.zh : '-'}`,
		},
		{
			title: '拼单人',
			index: 'user',
			format: (item, _col) =>
				`${
					(item.user ? item.user.name.zh : '-') +
					'/' +
					(item.user ? item.user.phone : '-') +
					'/' +
					(item.user ? item.user.email : '-')
				}`,
		},
		{
			title: '下单数量',
			index: 'quantity',
			sort: {
				compare: (a, b) => a.quantity - b.quantity,
			},
		},
		{
			title: '拼单时间',
			type: 'date',
			index: 'created_at',
			sort: {
				compare: (a, b) =>
					new Date(a.created_at).getTime() -
					new Date(b.created_at).getTime(),
			},
		},
		{
			title: '处理状态',
			index: 'status',
			render: 'status',
			filter: {
				menus: this.status,
				fn: (filter: any, record: any) =>
					record.status === filter.index,
			},
		},
		{
			title: '操作',
			buttons: [
				{
					text: '查看备注',
					click: (item: any) => this.openNoteModal(item),
				},
				{
					text: '查看地址',
					click: (item: any) => this.openAddressModal(item),
				},
			],
		},
	];
	selectedRows: STData[] = [];
	totalCallNo = 0;

	constructor(
		private cdr: ChangeDetectorRef,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
		private modalSrv: NzModalService,
	) {}

	ngOnInit() {
		this.status = this.comSrv.productStatus;
		this.data.record.pindans.forEach((element) => {
			element.status = 1;
		});
	}

	ngOnDestroy() {}

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
				break;
			case 'pi':
				break;
			case 'ps':
				break;
			case 'sort':
				break;
		}
	}

	openNoteModal(value) {
		this.modalSrv.info({
			nzTitle: '拼单备注',
			nzContent: value.contact_note || '-',
		});
	}

	openAddressModal(value) {
		this.selectedPindan = value;
		this.isOpenAddressModal = true;
	}
}
