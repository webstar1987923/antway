import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {
	SFComponent,
	SFRadioWidgetSchema,
	SFSchema,
	SFSelectWidgetSchema,
} from '@delon/form';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import * as _ from 'underscore';

@Component({
	selector: 'app-notice-modal',
	templateUrl: './notice-modal.component.html',
})
export class NoticeModalComponent implements OnInit {
	data: any = {};
	@ViewChild('sf', { static: false }) sf: SFComponent;
	schema: SFSchema;
	fileList: any[] = [[], []];
	subtagList = ['image', 'attach'];
	contentTabs: string[] = ['中文', '英文'];
	contents: string[] = [];
	del_asset_ids: any[] = [];
	uid = -1; // Negative is new file, positive is uploaded file

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.schema = {
			properties: {
				title_zh: {
					type: 'string',
					title: '标题',
					ui: {
						optional: '中文',
					},
					default: this.data.record.title_zh || '',
				},
				title_en: {
					type: 'string',
					title: '标题',
					ui: {
						optional: '英文',
					},
					default: this.data.record.title_en || '',
				},
				image: {
					type: 'string',
					title: '图片',
					ui: {
						widget: 'custom',
					},
				},
				content: {
					type: 'string',
					title: '内容',
					ui: {
						widget: 'custom',
					},
				},
				attach: {
					type: 'string',
					title: '附件',
					ui: {
						widget: 'custom',
					},
				},
			},
			required: ['title_zh', 'title_en'],
			ui: {
				spanLabelFixed: 120,
				grid: {
					span: 24,
				},
				size: 'small',
			},
		};
		if (this.data.record.id) {
			this.subtagList.forEach((element, idx) => {
				this.fileList[idx] = [];
				this.data.record.assets
					.filter((item) => item.subtag === element)
					.forEach((item) => {
						this.fileList[idx] = this.fileList[idx].concat([
							{
								uid: '' + item.id,
								name: item.id + '.png',
								status: 'done',
								url: item.url,
								redirect_url: item.redirect_url,
							},
						]);
					});
			});
		}
		this.contents = [
			this.data.record.content_zh || '',
			this.data.record.content_en || '',
		];
	}

	beforeUploadImage = (file: any): boolean => {
		this.processImage(file, 0);
		return false;
	};

	beforeUploadFile = (file: any): boolean => {
		this.processImage(file, 1);
		return false;
	};

	processImage(file: any, idx: number) {
		this.getBase64(file).then((res: string) => {
			this.fileList[idx] = this.fileList[idx].concat([
				{
					uid: '' + this.uid--,
					name: file.name,
					status: 'done',
					url: res,
					originFileObj: file,
				},
			]);
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

	save(value: any) {
		const postData: any = {
			...value,
			content_zh: this.contents[0],
			content_en: this.contents[1],
			del_asset_ids: this.del_asset_ids.join(','),
		};
		const formData = new FormData();
		this.fileList.forEach((element, idx) => {
			element.forEach((item) => {
				if (item.uid < 0) {
					// Use file name to carry individual subtag
					formData.append(
						'files[]',
						item.originFileObj,
						this.subtagList[idx] +
							'.' +
							item.originFileObj.name.split('.').pop(),
					);
				}
			});
		});
		// this.fileList.forEach((element: any, idx: number) => {
		// 	if (element.uid < 0) {
		// 		formData.append('attaches[]', element.originFileObj);
		// 	}
		// });
		// tslint:disable-next-line: forin
		for (const key in postData) {
			formData.append(key, postData[key]);
		}
		this.blkSrv.setBlockStatus(true);
		if (this.data.record.id) {
			formData.append('id', this.data.record.id);
			this.comSrv.updateNotice(formData).subscribe(
				(res: any) => {
					this.blkSrv.setBlockStatus(false);
					this.msgSrv.success(res.data.msg);
					this.modal.close(value);
				},
				(err: HttpErrorResponse) => {
					this.blkSrv.setBlockStatus(false);
				},
			);
		} else {
			this.comSrv.createNotice(formData).subscribe(
				(res: any) => {
					this.blkSrv.setBlockStatus(false);
					this.msgSrv.success(res.data.msg);
					this.modal.close(value);
				},
				(err: HttpErrorResponse) => {
					this.blkSrv.setBlockStatus(false);
				},
			);
		}
	}

	close() {
		this.modal.destroy();
	}
}
