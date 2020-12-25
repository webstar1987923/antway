import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { ExpoService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Subscription } from 'rxjs';

declare const BMap: any;
declare const BMAP_MAPTYPE_CONTROL_HORIZONTAL: any;
declare const BMAP_NORMAL_MAP: any;
declare const BMAP_SATELLITE_MAP: any;

@Component({
	selector: 'app-expo-banner',
	templateUrl: './expo-banner.component.html',
	styles: [
		`
			.logo-upload img {
				height: 96px;
				width: auto;
				max-width: 316px;
			}
		`,
	],
})
export class ExpoBannerComponent implements OnInit, OnDestroy {
	tabs: any[] = [
		{ name: 'PC端首页', description: '建议尺寸: 1480px * 450px' },
		{ name: '移动端首页', description: '建议尺寸: 750px * 310px' },
		{ name: 'PC端其他页面', description: '建议尺寸: 1480px * 280px' },
	];
	selectedTab = 0;
	expo: any = {};
	fileList: any[] = [];
	del_asset_ids: any[] = [];
	subtagList: any[] = [
		['dashboard_pc_zh', 'dashboard_pc_en'],
		['dashboard_mobile_zh', 'dashboard_mobile_en'],
		['extra_pc_zh', 'extra_pc_en'],
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
	}

	refresh() {
		if (this.expo && this.expo.assets) {
			this.subtagList[this.selectedTab].forEach((element, idx) => {
				this.fileList[idx] = [];
				this.expo.assets
					.filter((item) => item.subtag === element)
					.forEach((item) => {
						this.fileList[idx] = this.fileList[idx].concat([
							{
								uid: '' + item.id,
								name: 'image.png',
								status: 'done',
								url: item.url,
								redirect_url: item.redirect_url,
							},
						]);
					});
			});
		}
	}

	selectTab(idx: number) {
		this.selectedTab = idx;
		this.refresh();
	}

	beforeUploadZh = (file: any): boolean => {
		this.processImage(file, 0);
		return false;
	};

	beforeUploadEn = (file: any): boolean => {
		this.processImage(file, 1);
		return false;
	};

	processImage(file: any, idx: number) {
		this.getBase64(file).then((res: string) => {
			const nzFile: NzUploadFile = {
				uid: '' + this.uid--,
				name: 'image.png',
				status: 'done',
				url: res,
				originFileObj: file,
				redirect_url: '',
			};
			this.fileList[idx] = this.fileList[idx].concat([nzFile]);
			// this.saveFile(nzFile, this.subtagList[this.selectedTab][idx]);
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

	removeAsset(file: NzUploadFile) {
		if (+file.uid > 0) {
			this.del_asset_ids.push(file.uid);
		}
		for (let index = 0; index < 2; index++) {
			const idx = this.fileList[index].findIndex(
				(element) => element.uid === file.uid,
			);
			if (idx > -1) {
				this.fileList[index].splice(idx, 1);
			}
		}
	}

	moveAsset(file: NzUploadFile, direction) {
		for (let index = 0; index < 2; index++) {
			const idx = this.fileList[index].findIndex(
				(element) => element.uid === file.uid,
			);
			if (idx > -1) {
				if (direction === 'up') {
					if (idx === 0) {
						return;
					}
					[
						this.fileList[index][idx - 1],
						this.fileList[index][idx],
					] = [
						this.fileList[index][idx],
						this.fileList[index][idx - 1],
					];
				}
				if (direction === 'down') {
					if (idx === this.fileList[index].length - 1) {
						return;
					}
					[
						this.fileList[index][idx],
						this.fileList[index][idx + 1],
					] = [
						this.fileList[index][idx + 1],
						this.fileList[index][idx],
					];
				}
				break;
			}
		}
	}

	save() {
		const postData = {
			id: this.expo.id,
			del_asset_ids: this.del_asset_ids.length
				? this.del_asset_ids
				: null,
		};
		const formData = new FormData();
		const assets_data = {};
		this.fileList.forEach((element, idx) => {
			element.forEach((item, index) => {
				if (item.uid < 0) {
					// Use file name to carry individual subtag and redirction_url
					formData.append(
						'images[]',
						item.originFileObj,
						item.uid +
							'.' +
							item.originFileObj.name.split('.').pop(),
					);
				}
				assets_data[item.uid] = {
					subtag: this.subtagList[this.selectedTab][idx],
					redirect_url: item.redirect_url,
					ord: index,
				};
			});
		});
		formData.append('assets_data', JSON.stringify(assets_data));
		// tslint:disable-next-line: forin
		for (const key in postData) {
			formData.append(key, postData[key]);
		}
		this.blkSrv.setBlockStatus(true);
		this.comSrv.updateExpo(formData).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.msgSrv.success(res.data.msg);
				this.expoSrv.setExpo(res.data.rlt);
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}
}
