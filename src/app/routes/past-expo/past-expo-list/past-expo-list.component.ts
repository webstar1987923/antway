import { HttpErrorResponse } from '@angular/common/http';
import {
	ChangeDetectorRef,
	Component,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { STChange, STColumn, STComponent, STData } from '@delon/abc/st';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { ExpoService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import * as _ from 'underscore';
import { ExpoViewComponent } from '../expo-view/expo-view.component';

@Component({
	selector: 'app-past-expo-list',
	templateUrl: './past-expo-list.component.html',
})
export class PastExpoListComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		past: true,
	};
	expoes: any[] = [];

	total = 0;
	list: any[] = [];
	status = [];
	expoTypes = [];
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[];
	selectedRows: STData[] = [];
	totalCallNo = 0;

	constructor(
		private cdr: ChangeDetectorRef,
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private expoSrv: ExpoService,
		private modal: ModalHelper,
		private modalSrv: NzModalService,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.status = this.comSrv.expoStatus;
		this.refreshColumn();
		this.getData();
		this.getExpoTypes();
	}

	ngOnDestroy() {}

	refreshColumn() {
		this.columns = [
			{
				title: '展会名称',
				index: 'expo_type',
				format: (item, _col) =>
					`${
						(item.expo_type.name.zh || '-') +
						'<br>' +
						(item.expo_type.name.en || '-')
					}`,
				filter: {
					menus: this.expoTypes,
					multiple: false,
				},
			},
			{
				title: '举办名称',
				index: 'name',
				format: (item, _col) =>
					`${(item.name.zh || '-') + '<br>' + (item.name.en || '-')}`,
			},
			{
				title: '参展企业数',
				index: 'name',
				format: (item, _col) => `${item.seller_cnt}`,
				sort: true,
			},
			{
				title: '参观人数',
				index: 'name',
				format: (item, _col) => `${item.buyer_cnt}`,
				sort: true,
			},
			{
				title: '状态',
				index: 'status',
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
						click: (item: any) => this.openExpoView(item),
					},
				],
			},
		];
	}

	getData() {
		this.blkSrv.setBlockStatus(true);
		this.comSrv.getExpoes(this.queryParams).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.expoes = res.data.list;
				console.log('Expoes:', this.expoes);
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	getExpoTypes() {
		this.blkSrv.setBlockStatus(true);
		this.comSrv.getExpoTypes().subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.expoTypes = [];
				res.data.list.forEach((element) => {
					this.expoTypes.push({
						value: element.id,
						text: element.name.zh,
						label: element.name.zh,
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
		}
	}

	openExpoView(record: any = {}) {
		this.modal
			.create(ExpoViewComponent, { data: { record } }, { size: 1200 })
			.subscribe((res: any = '') => {
				this.getData();
			});
	}
}
