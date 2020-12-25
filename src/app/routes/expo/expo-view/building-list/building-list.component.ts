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
import { ExpoService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
	selector: 'app-building-list',
	templateUrl: './building-list.component.html',
})
export class BuildingListComponent implements OnInit, OnDestroy {
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
	columns: STColumn[] = [
		{
			title: '馆号',
			index: 'map_id',
			format: (item, _col) => `${item.map_id || '-'}`,
		},
		{
			title: '中文名称',
			index: 'name_zh',
			format: (item, _col) => `${item.name.zh || '-'}`,
		},
		{
			title: '英文名称',
			index: 'name_en',
			format: (item, _col) => `${item.name.en || '-'}`,
		},
		{
			title: '展位数量',
			index: 'hall_cnt',
			format: (item, _col) => `${item.hall_cnt || '0'}`,
		},
	];
	selectedRows: STData[] = [];
	totalCallNo = 0;

	constructor(
		private blkSrv: BlockUIService,
		private cdr: ChangeDetectorRef,
		private comSrv: CommonService,
		private expoSrv: ExpoService,
		private modal: ModalHelper,
		private modalSrv: NzModalService,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.getData();
	}

	ngOnDestroy() {}

	getData() {
		this.loading = true;
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});
		this.comSrv
			.getExpoBuildings({
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
