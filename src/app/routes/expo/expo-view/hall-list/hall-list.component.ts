import { HttpErrorResponse } from '@angular/common/http';
import {
	ChangeDetectorRef,
	Component,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { STChange, STColumn, STComponent, STData } from '@delon/abc/st';
import { ModalHelper } from '@delon/theme';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
	selector: 'app-hall-list',
	templateUrl: './hall-list.component.html',
})
export class HallListComponent implements OnInit, OnDestroy {
	data: any = {};
	queryParams: any = {
		pi: 1,
		ps: 10,
		active: '',
		direction: '',
	};
	loading = false;
	total = 0;
	list: any[] = [];

	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[];
	selectedRows: STData[] = [];
	totalCallNo = 0;
	buildings: any[] = [];

	constructor(
		private blkSrv: BlockUIService,
		private cdr: ChangeDetectorRef,
		private comSrv: CommonService,
		private modal: ModalHelper,
		private modalSrv: NzModalService,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.refreshColumn();
		this.getBuildings();
		this.getData();
	}

	ngOnDestroy() {}

	refreshColumn() {
		this.columns = [
			{
				title: '馆号',
				index: 'building',
				format: (item, _col) => `${item.building?.map_id || '-'}`,
				filter: {
					menus: this.buildings,
					multiple: false,
				},
			},
			{
				title: '展位号',
				index: 'map_id',
				format: (item, _col) => `${item.map_id || '-'}`,
			},
			{
				title: '面积',
				index: 'area',
				format: (item, _col) => `${item.area || '-'}`,
			},
			{
				title: '价格',
				index: 'price',
				format: (item, _col) => `${item.price || '-'}`,
			},
		];
	}

	getBuildings() {
		this.comSrv
			.getExpoBuildings({
				expo_id: this.data.record.id,
			})
			.subscribe(
				(res: any) => {
					this.buildings = [];
					res.data.list.forEach((element) => {
						this.buildings.push({
							value: element.id,
							text: element.map_id,
						});
					});
					this.refreshColumn();
				},
				(err: HttpErrorResponse) => {},
			);
	}

	getData() {
		this.loading = true;
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});
		this.comSrv
			.getExpoHallList({
				...this.queryParams,
				expo_id: this.data.record.id,
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
}
