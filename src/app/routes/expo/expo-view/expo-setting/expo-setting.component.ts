import { HttpErrorResponse } from '@angular/common/http';
import {
	ChangeDetectorRef,
	Component,
	Input,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { ExpoService } from '@shared';
import { AbmComponent } from 'angular-baidu-maps';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Subscription } from 'rxjs';

declare const BMap: any;
declare const BMAP_MAPTYPE_CONTROL_HORIZONTAL: any;
declare const BMAP_NORMAL_MAP: any;
declare const BMAP_SATELLITE_MAP: any;

@Component({
	selector: 'app-expo-setting',
	templateUrl: './expo-setting.component.html',
	styles: [
		`
			.logo-upload img {
				height: 64px;
				width: auto;
				max-width: 200px;
			}
		`,
	],
})
export class ExpoSettingComponent implements OnInit, OnDestroy {
	expo: any = {};
	logoList: any[] = [];
	subtagList: any[] = [
		'logo_pc_zh',
		'logo_pc_en',
		'logo_mobile_zh',
		'logo_mobile_en',
	];
	uid = -1; // Negative is new file, positive is uploaded file
	expoSubscription: Subscription;

	options: any = {};
	_map: any;
	marker: any;

	constructor(
		private cdr: ChangeDetectorRef,
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private expoSrv: ExpoService,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.expoSubscription = this.expoSrv
			.getExpoUpdates()
			.subscribe((expo) => {
				this.expo = expo;
				this.refresh();
			});
	}

	ngOnDestroy() {
		this.expoSubscription.unsubscribe();
		this._map.removeEventListener('click', this.clickBaidu.bind(this));
	}

	onReady(map: any) {
		this._map = map;
		if (this.expo.lat && this.expo.lng) {
			const point = new BMap.Point(this.expo.lng, this.expo.lat);
			map.centerAndZoom(point, 11);
			this.marker = new BMap.Marker(point);
			this._map.addOverlay(this.marker);
		} else {
			map.centerAndZoom(new BMap.Point(116.404, 39.915), 11);
		}
		map.addControl(
			new BMap.MapTypeControl({
				type: BMAP_MAPTYPE_CONTROL_HORIZONTAL,
				mapTypes: [BMAP_NORMAL_MAP, BMAP_SATELLITE_MAP],
			}),
		);
		map.enableScrollWheelZoom(true);
		map.addEventListener('click', this.clickBaidu.bind(this));
	}

	clickBaidu(e: any) {
		this._map.removeOverlay(this.marker);
		this.marker = new BMap.Marker(e.point);
		this._map.addOverlay(this.marker);
	}

	refresh() {
		if (this.expo && this.expo.assets) {
			this.subtagList.forEach((element, idx) => {
				const assetIdx = this.expo.assets.findIndex(
					(item) => item.subtag === element,
				);
				if (assetIdx > -1) {
					this.logoList[idx] = [
						{
							uid: '' + this.expo.assets[assetIdx].id,
							name: 'image.png',
							status: 'done',
							url: this.expo.assets[assetIdx].url,
						},
					];
				}
			});
		}
	}

	beforeUploadLogo0 = (file: any): boolean => {
		this.processImage(file, 0);
		return false;
	};

	beforeUploadLogo1 = (file: any): boolean => {
		this.processImage(file, 1);
		return false;
	};

	beforeUploadLogo2 = (file: any): boolean => {
		this.processImage(file, 2);
		return false;
	};

	beforeUploadLogo3 = (file: any): boolean => {
		this.processImage(file, 3);
		return false;
	};

	processImage(file: any, idx: number) {
		this.getBase64(file).then((res: string) => {
			this.logoList[idx] = [
				{
					uid: '' + this.uid--,
					name: 'image.png',
					status: 'done',
					url: res,
					originFileObj: file,
				},
			];
			this.saveLogo(this.logoList[idx][0], this.subtagList[idx]);
		});
	}

	getBase64(file: any): Promise<string | ArrayBuffer | null> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result.toString());
			reader.onerror = (error) => reject(error);
		});
	}

	saveLogo(file: NzUploadFile, subtag: string) {
		this.blkSrv.setBlockStatus(true);
		const formData = new FormData();
		formData.append('logos[]', file.originFileObj);
		formData.append('id', this.expo.id);
		formData.append('subtag', subtag);
		this.comSrv.updateExpo(formData).subscribe((res: any) => {
			this.blkSrv.setBlockStatus(false);
			this.msgSrv.success(res.data.msg);
			this.expoSrv.setExpo(res.data.rlt);
		});
	}

	saveLocation() {
		if (this.marker) {
			this.blkSrv.setBlockStatus(true);
			const postData = {
				id: this.expo.id,
				lng: this.marker.point.lng,
				lat: this.marker.point.lat,
			};
			this.comSrv.updateExpo(postData).subscribe((res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.msgSrv.success(res.data.msg);
				this.expoSrv.setExpo(res.data.rlt);
			});
		} else {
			this.msgSrv.info('选择');
		}
	}
}
