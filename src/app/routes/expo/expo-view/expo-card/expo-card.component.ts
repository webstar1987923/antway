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
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-expo-card',
	templateUrl: './expo-card.component.html',
	styles: [
		`
			.file-upload img {
				height: auto;
				width: 430px;
			}
		`,
	],
})
export class ExpoCardComponent implements OnInit, OnDestroy {
	expo: any = {};
	fileList: any[] = [];
	subtagList: any[] = ['buyer_card'];
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
			this.subtagList.forEach((element, idx) => {
				const assetIdx = this.expo.assets.findIndex(
					(item) => item.subtag === element,
				);
				if (assetIdx > -1) {
					this.fileList[idx] = [
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

	beforeUploadFile = (file: any): boolean => {
		this.processImage(file, 0);
		return false;
	};

	processImage(file: any, idx: number) {
		this.getBase64(file).then((res: string) => {
			this.fileList[idx] = [
				{
					uid: '' + this.uid--,
					name: 'image.png',
					status: 'done',
					url: res,
					originFileObj: file,
				},
			];
			this.saveLogo(this.fileList[idx][0], this.subtagList[idx]);
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
}
