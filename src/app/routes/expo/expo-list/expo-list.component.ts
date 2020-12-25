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
import { ExpoModalComponent } from '../expo-modal/expo-modal.component';
import { ExpoTypeModalComponent } from '../expo-type-modal/expo-type-modal.component';
import { ExpoViewComponent } from '../expo-view/expo-view.component';

@Component({
	selector: 'app-expo-list',
	templateUrl: './expo-list.component.html',
})
export class ExpoListComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		expo_type_id: '',
	};
	expoTypes: any[] = [];
	selectedExpoType: any = {};
	expoes: any[] = [];

	total = 0;
	list: any[] = [];
	status = [];
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
		this.getExpoTypes();
	}

	ngOnDestroy() {}

	refreshColumn() {
		this.columns = [
			{
				title: '展会',
				index: 'expo',
				format: (item, _col) =>
					`${
						(item.expo_type.name.zh || '-') +
						'<br>' +
						(item.expo_type.name.en || '-')
					}`,
			},
			{
				title: '举办名称',
				index: 'name',
				format: (item, _col) =>
					`${(item.name.zh || '-') + '<br>' + (item.name.en || '-')}`,
			},
			{
				title: '举办时间',
				index: 'name',
				format: (item, _col) =>
					`${
						(item.startdate || '-') + ' ~ ' + (item.enddate || '-')
					}`,
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
						text: '修改',
						click: (item: any) => this.openExpoModal(item),
					},
					{
						text: '查看',
						click: (item: any) => this.openExpoView(item),
					},
					{
						text: '预览',
						click: (item: any) => {
							window.open(
								`http://expo.antway.cn/${item.expo_type.description.en}`,
								'_blank',
							);
						},
					},
					{
						text: '更多',
						children: [
							{
								text: '展会内容',
								click: (item: any) =>
									this.openExpoView(item, 0),
							},
							{
								text: '展馆设置',
								click: (item: any) =>
									this.openExpoView(item, 2),
							},
							{
								text: '展会设置',
								click: (item: any) =>
									this.openExpoView(item, 3),
							},
							{
								text: '大巴设置',
								click: (item: any) =>
									this.openExpoView(item, 5),
							},
						],
					},
				],
			},
		];
	}

	getExpoTypes() {
		this.blkSrv.setBlockStatus(true);
		this.comSrv.getExpoTypes().subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				console.log('Expo types:', res.data.list);
				this.expoTypes = [
					{
						id: 0,
						title: '所有展会',
					},
				].concat(res.data.list);
				if (this.selectedExpoType.id) {
					this.selectExpoType(
						this.expoTypes.find(
							(element) =>
								element.id === this.selectedExpoType.id,
						),
					);
				} else {
					this.selectExpoType(this.expoTypes[0]);
				}
				this.cdr.detectChanges();
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	selectExpoType(record: any) {
		this.selectedExpoType = record;
		this.queryParams.expo_type_id = this.selectedExpoType.id || '';
		this.getExpoes();
	}

	openExpoTypeModal(record: any = {}) {
		this.modal
			.create(
				ExpoTypeModalComponent,
				{ data: { record } },
				{ size: 1000 },
			)
			.subscribe((res) => {
				this.getExpoTypes();
				this.cdr.detectChanges();
			});
	}

	deleteExpoType(record: any) {
		const modal = this.modalSrv.confirm({
			nzTitle: '<strong>是否确定删除<strong>',
			nzContent: '删除后就无法挽回咯~',
			nzOkType: 'danger',
			nzOnOk: () => {
				this.blkSrv.setBlockStatus(true);
				this.comSrv.deleteExpoType(record.id).subscribe((res: any) => {
					this.blkSrv.setBlockStatus(false);
					this.getExpoTypes();
				});
			},
		});
	}

	getExpoes() {
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
				this.getExpoes();
				break;
			case 'pi':
				this.queryParams.pi = e.pi;
				// this.getExpoes();
				break;
			case 'ps':
				this.queryParams.ps = e.ps;
				// this.getExpoes();
				break;
		}
	}

	openExpoModal(record: any = {}) {
		const allExpoTypes = [];
		this.expoTypes.forEach((element) => {
			if (element.id) {
				allExpoTypes.push({
					label: element.name.zh,
					value: element.id,
				});
			}
		});
		this.modal
			.create(
				ExpoModalComponent,
				{ data: { record, expoTypes: allExpoTypes } },
				{ size: 1000 },
			)
			.subscribe((res) => {
				this.getExpoTypes();
				this.cdr.detectChanges();
			});
	}

	openExpoView(record: any = {}, selectedTab: number = 0) {
		this.modal
			.create(
				ExpoViewComponent,
				{ data: { record, selectedTab } },
				{ size: 1200, includeTabs: true },
			)
			.subscribe((res: any = '') => {
				this.getExpoTypes();
			});
	}
}
