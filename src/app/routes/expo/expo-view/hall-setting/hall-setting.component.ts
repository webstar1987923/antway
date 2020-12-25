import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

// Delon
import { XlsxService } from '@delon/abc/xlsx';
import {
	SFComponent,
	SFSchema,
	SFTextWidgetSchema,
	SFUploadWidgetSchema,
} from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';

// Zorro
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzUploadFile } from 'ng-zorro-antd/upload';

// Custom services
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { ExpoService } from '@shared';

// Plugins
import * as _ from 'underscore';

// Components
import { BuildingListComponent } from '../building-list/building-list.component';
import { HallListComponent } from '../hall-list/hall-list.component';
import { MapModalComponent } from '../map-modal/map-modal.component';

@Component({
	selector: 'app-hall-setting',
	templateUrl: './hall-setting.component.html',
})
export class HallSettingComponent implements OnInit {
	expo: any;
	haveToSaveBuilding = false;
	buildingObject: any = {};
	buildings: any = [];
	fileList: any[] = [];
	uid = -1; // Negative is new file, positive is uploaded file
	expoSubscription: Subscription;

	@ViewChild('sf', { static: false }) sf: SFComponent;
	schema: SFSchema;

	constructor(
		private cdr: ChangeDetectorRef,
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private expoSrv: ExpoService,
		private modal: NzModalRef,
		private modalSrv: NzModalService,
		private msgSrv: NzMessageService,
		private modalHelper: ModalHelper,
		private xlsx: XlsxService,
	) {}

	ngOnInit() {
		this.refresh();
		this.expoSubscription = this.expoSrv
			.getExpoUpdates()
			.subscribe((expo) => {
				this.expo = expo;
				this.refresh();
			});
	}

	refresh() {
		this.schema = {
			properties: {
				apartment_zh: {
					type: 'string',
					title: '全部展馆名称',
					ui: {
						optional: '中文',
					},
					default: this.expo?.apartment?.name?.zh || null,
				},
				apartment_en: {
					type: 'string',
					title: '全部展馆名称',
					ui: {
						optional: '英文',
					},
					default: this.expo?.apartment?.name?.en || null,
				},
			},
			required: ['apartment_zh', 'apartment_en'],
			ui: {
				spanLabelFixed: 150,
				grid: {
					span: 12,
				},
				size: 'small',
			},
		};
		if (this.expo && this.expo.buildings) {
			this.buildings = [];
			this.expo.buildings.forEach((item) => {
				this.buildings = this.buildings.concat([
					{
						...item,
						hall_json: item.hall_json
							? {
									uid: '' + item.hall_json.id,
									name: item.hall_json.url,
									status: 'done',
									url: item.hall_json.url,
							  }
							: null,
						hall_bg: item.hall_bg
							? {
									uid: '' + item.hall_bg.id,
									name: item.hall_bg.url,
									status: 'done',
									url: item.hall_bg.url,
							  }
							: null,
					},
				]);
			});
		}
		if (this.expo && this.expo.apartment) {
			this.expo.apartment = {
				...this.expo.apartment,
				hall_json: this.expo.apartment.hall_json
					? {
							uid: '' + this.expo.apartment.hall_json.id,
							name: this.expo.apartment.hall_json.url,
							status: 'done',
							url: this.expo.apartment.hall_json.url,
					  }
					: null,
				hall_bg: this.expo.apartment.hall_bg
					? {
							uid: '' + this.expo.apartment.hall_bg.id,
							name: this.expo.apartment.hall_bg.url,
							status: 'done',
							url: this.expo.apartment.hall_bg.url,
					  }
					: null,
			};
		}
	}

	isValidData() {
		if (!this.buildings?.length) {
			return false;
		}
		return true;
	}

	beforeUploadFile = (file: any): boolean => {
		this.fileList = [
			{
				uid: 0,
				name: file.name,
				status: 'done',
				originFileObj: file,
			},
		];

		this.xlsx.import(file).then((res: any) => {
			const tempBuildings = [];
			const hallList = [];
			for (const key in res) {
				if (Object.prototype.hasOwnProperty.call(res, key)) {
					if (key === '展馆') {
						const data = res[key];
						if (data && data.length) {
							data.forEach((element, idx) => {
								// Skip first row that is column name
								if (idx) {
									let index = 0;
									const hall_json =
										this.buildings.find(
											(item) =>
												item.map_id === element[0],
										)?.hall_json || null;
									const hall_bg =
										this.buildings.find(
											(item) =>
												item.map_id === element[0],
										)?.hall_bg || null;
									tempBuildings.push({
										map_id: element[index++],
										name_zh: element[index++],
										name_en: element[index++],
										hall_json,
										hall_bg,
									});
								}
							});
						}
					} else if (key === '展位') {
						const data = res[key];
						if (data && data.length) {
							data.forEach((element, idx) => {
								// Skip first row that is column name
								if (idx) {
									let index = 0;
									hallList.push({
										hall_id: element[index++],
										map_id: element[index++],
										area: element[index++],
										price: element[index++],
									});
								}
							});
						}
					}
				}
			}
			if (!(tempBuildings.length && hallList.length)) {
				this.msgSrv.error('展位批量导入数据错误');
				return true;
			}
			this.buildings = tempBuildings;

			this.buildingObject = _.chain(hallList).groupBy('hall_id').value();
			this.expo.halls = _.size(hallList);
			this.haveToSaveBuilding = true;
			this.cdr.detectChanges();
		});
		return false;
	};

	uploadMap(index: number) {
		this.modalHelper
			.create(
				MapModalComponent,
				{
					data: {
						record:
							index > -1
								? this.buildings[index]
								: this.expo.apartment,
					},
				},
				{ size: 'md' },
			)
			.subscribe((res) => {
				this.expoSrv.setExpo(res);
				this.cdr.detectChanges();
			});
	}

	save(value: any = {}) {
		if (!this.isValidData()) {
			this.msgSrv.error('请导入展馆数据');
			return;
		}
		this.modalSrv.confirm({
			nzTitle: '<strong>是否确定重置数据<strong>',
			nzContent: '重置数据后就无法挽回咯~',
			nzOkType: 'danger',
			nzOnOk: () => {
				const postData = {
					id: this.expo.id,
					apartment: {
						name_zh: value.apartment_zh,
						name_en: value.apartment_en,
					},
					buildingObject: null,
					buildings: null,
				};
				// Building setting
				const tempBuildings: any = [];
				this.buildings.forEach((element, idx) => {
					tempBuildings.push({
						map_id: element.map_id,
						name_zh: element.name_zh,
						name_en: element.name_zh,
					});
				});
				if (this.haveToSaveBuilding) {
					postData.buildingObject = this.buildingObject;
					postData.buildings = tempBuildings;
				}

				this.blkSrv.setBlockStatus(true);
				this.comSrv.updateExpo(postData).subscribe(
					(res: any) => {
						this.blkSrv.setBlockStatus(false);
						this.haveToSaveBuilding = false;
						this.msgSrv.success(res.data.msg);
						this.expoSrv.setExpo(res.data.rlt);
					},
					(err: HttpErrorResponse) => {
						this.blkSrv.setBlockStatus(false);
					},
				);
			},
		});
	}

	downloadTemplate() {
		const buildingData = [
			['馆号', '中文名称', '英文名称'],
			['hall-1', '一号馆', 'Hall No 1'],
			['hall-2', '一号馆', 'Hall No 2'],
		];
		const hallData = [
			['馆号', '展位号', '面积', '价格'],
			['hall-1', 'h1-001', '10', '10'],
			['hall-1', 'h1-002', '10', '10'],
			['hall-1', 'h1-003', '10', '10'],
			['hall-1', 'h1-004', '10', '10'],
			['hall-1', 'h1-005', '10', '10'],
			['hall-2', 'h2-001', '10', '10'],
			['hall-2', 'h2-002', '10', '10'],
			['hall-2', 'h2-003', '10', '10'],
			['hall-2', 'h2-004', '10', '10'],
			['hall-2', 'h2-005', '10', '10'],
		];

		this.xlsx.export({
			filename: `展位批量导入模板.xlsx`,
			sheets: [
				{
					data: buildingData,
					name: '展馆',
				},
				{
					data: hallData,
					name: '展位',
				},
			],
		});
	}

	openBuilding(record: any = {}) {
		this.modalHelper
			.create(BuildingListComponent, { data: { record } }, { size: 1000 })
			.subscribe((res) => {});
	}

	openHall(record: any = {}) {
		this.modalHelper
			.create(HallListComponent, { data: { record } }, { size: 1000 })
			.subscribe((res) => {});
	}
}
