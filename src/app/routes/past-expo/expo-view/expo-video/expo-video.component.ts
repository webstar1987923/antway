import {
	HttpErrorResponse,
	HttpEventType,
	HttpResponse,
} from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { ExpoService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-expo-video',
	templateUrl: './expo-video.component.html',
	styles: [
		`
			.logo-upload {
				position: relative;
			}
			.logo-upload video {
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
export class ExpoVideoComponent implements OnInit, OnDestroy {
	expo: any = {};
	videoList: any[] = [];
	del_asset_ids: any[] = [];
	uid = -1; // Negative is new file, positive is uploaded file
	expoSubscription: Subscription;
	public percentDone = 0;
	public uploadingVideo = false;

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
			this.videoList = [];
			this.expo.assets
				.filter((item) => item.subtag === 'video')
				.forEach((item) => {
					this.videoList = this.videoList.concat([
						{
							uid: '' + item.id,
							name: 'image.png',
							status: 'done',
							url: item.url,
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
			};
			this.videoList = this.videoList.concat([nzFile]);
			this.saveFile(nzFile);
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
			const idx = this.videoList.findIndex(
				(element) => element.uid === file.uid,
			);
			if (idx > -1) {
				this.videoList.splice(idx, 1);
				this.blkSrv.setBlockStatus(true);
				const postData = {
					id: this.expo.id,
					del_asset_ids: file.uid,
				};
				this.comSrv.updateExpo(postData).subscribe(
					(res: any) => {
						this.blkSrv.setBlockStatus(false);
						this.msgSrv.success(res.data.msg);
					},
					(err: HttpErrorResponse) => {
						this.blkSrv.setBlockStatus(false);
					},
				);
			}
		}
	}

	saveFile(file: NzUploadFile) {
		this.blkSrv.setBlockStatus(true);
		const formData = new FormData();
		formData.append('videos[]', file.originFileObj);
		formData.append('id', this.expo.id);
		formData.append('subtag', 'video');

		this.uploadingVideo = true;
		this.comSrv.uploadExpoVideo(formData).subscribe(
			(event) => {
				if (event.type === HttpEventType.UploadProgress) {
					this.percentDone = Math.round(
						(100 * event.loaded) / event.total,
					);
				} else if (event instanceof HttpResponse) {
					this.blkSrv.setBlockStatus(false);
					this.uploadingVideo = false;
					this.percentDone = 0;
					const body: any = event.body;
					this.msgSrv.success(body.data.msg);
				}
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
				this.uploadingVideo = false;
				this.percentDone = 0;
			},
		);
	}
}
