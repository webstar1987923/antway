import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { ExpoService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-cooperative-image',
	templateUrl: './cooperative-image.component.html',
	styles: [
		`
			.logo-upload {
				position: relative;
				text-align: center;
			}
			.logo-upload img {
				height: 105px;
				width: 140px;
			}
			.logo-upload .delete {
				position: absolute;
				bottom: 0;
				left: 0;
				width: 100%;
				height: 30px;
				text-align: center;
				line-height: 30px;
				background-color: rgba(255, 0, 0, 0.43);
				color: #fff;
				display: none;
			}
			.logo-upload:hover .delete {
				display: unset;
			}
		`,
	],
})
export class CooperativeImageComponent implements OnInit, OnDestroy {
	expo: any = {};
	pictureList: any[] = [];
	del_asset_ids: any[] = [];
	uid = -1; // Negative is new file, positive is uploaded file
	expoSubscription: Subscription;

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
			this.pictureList = [];
			this.expo.assets
				.filter((item) => item.subtag === 'cooperative_image')
				.forEach((item) => {
					this.pictureList = this.pictureList.concat([
						{
							uid: '' + item.id,
							name: 'image.png',
							status: 'done',
							url: item.url,
							redirect_url: item.redirect_url,
						},
					]);
				});
		}
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
			this.pictureList = this.pictureList.concat([nzFile]);
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
			const idx = this.pictureList.findIndex(
				(element) => element.uid === file.uid,
			);
			if (idx > -1) {
				this.pictureList.splice(idx, 1);
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
		this.pictureList.forEach((item, index) => {
			if (item.uid < 0) {
				// Use file name to carry individual subtag and redirction_url
				formData.append(
					'images[]',
					item.originFileObj,
					item.uid + '.' + item.originFileObj.name.split('.').pop(),
				);
			}
			assets_data[item.uid] = {
				subtag: 'cooperative_image',
				redirect_url: item.redirect_url,
				ord: index,
			};
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
