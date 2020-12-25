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
import { XlsxService } from '@delon/abc/xlsx';
import { ModalHelper } from '@delon/theme';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import * as _ from 'underscore';

@Component({
	selector: 'app-ads-view',
	templateUrl: './ads-view.component.html',
})
export class AdsViewComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		tag: '2',
		active: '',
		direction: '',
	};
	data: any = {};
	total = 0;
	list: any[] = [];
	status = [];
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{
			title: '名称',
			index: 'name',
			format: (item, _col) => `${item.addition.name || '-'}`,
		},
		{
			title: '规格',
			index: 'property',
			format: (item, _col) => `${item.addition.property || '-'}`,
		},
		{
			title: '预订租价',
			type: 'currency',
			index: 'price1',
			format: (item, _col) => `${item.addition.price1 || '-'}`,
		},
		{
			title: '现场租价',
			type: 'currency',
			index: 'price2',
			format: (item, _col) => `${item.addition.price2 || '-'}`,
		},
		{
			title: '押金',
			type: 'currency',
			index: 'prepay_price',
			format: (item, _col) => `${item.addition.prepay_price || '-'}`,
		},
		{
			title: '数量',
			index: 'quantity',
			format: (item, _col) => `${item.quantity || '-'}`,
		},
		{
			title: '小计',
			type: 'currency',
			index: 'price',
			format: (item, _col) => `${item.price || '-'}`,
		},
		{
			title: '状态',
			index: 'status',
			render: 'status',
			filter: {
				menus: this.status,
				fn: (filter: any, record: any) =>
					record.status === filter.index,
			},
		},
	];
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
		this.status = this.comSrv.expoDeviceStatus;
		this.getData();
	}

	ngOnDestroy() {}

	getData() {
		this.blkSrv.setBlockStatus(true);
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});
		this.comSrv
			.getExpoAdditions({
				...this.queryParams,
				expo_id: this.data.record.expo_id,
				user_id: this.data.record.user_id,
			})
			.subscribe(
				(res: any) => {
					this.blkSrv.setBlockStatus(false);
					console.log('Ads list', res);
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

	reset() {
		// wait form reset updated finished
		setTimeout(() => this.getData());
	}

	saveStatus(form: any) {
		if (form.valid) {
			const postData = JSON.parse(JSON.stringify(form.value));
			postData.ids = _.pluck(this.list, 'id').join(',');
			this.blkSrv.setBlockStatus(true);
			this.comSrv.changeAdditionStatus(postData).subscribe(
				(res: any) => {
					this.blkSrv.setBlockStatus(false);
					this.msgSrv.success(res.data.msg);
					this.getData();
				},
				(err: HttpErrorResponse) => {
					this.blkSrv.setBlockStatus(false);
				},
			);
		}
	}

	download() {
		this.modalSrv.confirm({
			nzTitle: '<strong>是否确定导出搜索结果<strong>',
			nzOnOk: () => {
				this.blkSrv.setBlockStatus(true);
				this.comSrv
					.getExpoAdditions({
						...this.queryParams,
						expo_id: this.data.record.expo_id,
						user_id: this.data.record.user_id,
						pi: '',
						ps: '',
					})
					.subscribe(
						(res: any) => {
							this.blkSrv.setBlockStatus(false);
							const data = [
								[
									'名称',
									'规格',
									'预订租价',
									'现场租价',
									'押金',
									'数量',
									'小计',
									'状态',
								],
							];
							res.data.list.forEach((element) => {
								data.push([
									element.addition.name || '-',
									element.addition.property || '-',
									element.addition.price1 || '-',
									element.addition.price2 || '-',
									element.addition.prepay_price || '-',
									element.quantity || '-',
									element.price || '-',
									this.status[element.status].label || '-',
								]);
							});
							this.xlsx.export({
								filename: `展具租赁.xlsx`,
								sheets: [
									{
										data,
										name: '展具租赁',
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
}
