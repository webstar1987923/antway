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
import { ModalHelper } from '@delon/theme';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { ExpoService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import { BusDescriptionComponent } from '../bus-description/bus-description.component';
import { BusModalComponent } from '../bus-modal/bus-modal.component';

@Component({
	selector: 'app-bus-list',
	templateUrl: './bus-list.component.html',
})
export class BusListComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		active: '',
		direction: '',
	};
	loading = false;
	expo: any = {};
	expoSubscription: Subscription;
	total = 0;
	list: any[] = [];

	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{
			title: '班次名称 - 中文',
			index: 'expo',
			format: (item, _col) => `${item.name.zh || '-'}`,
		},
		{
			title: '班次名称 - 英文',
			index: 'expo',
			format: (item, _col) => `${item.name.en || '-'}`,
		},
		{
			title: '日期',
			index: 'date',
			format: (item, _col) => `${item.date?.split(',').length || '-'}`,
		},
		{
			title: '操作',
			buttons: [
				{
					text: '修改',
					click: (item: any) => this.openBusModal(item),
				},
				{
					text: '注意事项',
					click: (item: any) => this.openBusDescription(item),
				},
				{
					text: '删除',
					click: (item: any) => this.remove(item.id),
				},
			],
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
		this.expoSubscription = this.expoSrv
			.getExpoUpdates()
			.subscribe((expo) => {
				this.expo = expo;
				if (this.expo.id) {
					this.getData();
				}
			});
	}

	ngOnDestroy() {
		this.expoSubscription.unsubscribe();
	}

	getData() {
		this.loading = true;
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});
		this.comSrv
			.getBuses({ ...this.queryParams, expo_id: this.expo.id })
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

	remove(id?) {
		const ids = id ? id : this.selectedRows.map((i) => i.id).join(',');
		if (ids) {
			this.modalSrv.confirm({
				nzTitle: '<strong>是否确定删除<strong>',
				nzOkType: 'danger',
				nzOnOk: () => {
					this.loading = true;
					this.comSrv.deleteBus(ids).subscribe(
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

	openBusModal(record: any = {}) {
		this.modal
			.create(
				BusModalComponent,
				{ data: { record, expo_id: this.expo.id } },
				{ size: 'md' },
			)
			.subscribe((res) => {
				this.getData();
			});
	}

	openBusDescription(record: any = {}) {
		this.modal
			.create(
				BusDescriptionComponent,
				{ data: { record, expo_id: this.expo.id } },
				{ size: 'md' },
			)
			.subscribe((res) => {
				this.getData();
			});
	}
}
