import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SFComponent, SFSchema, SFSelectWidgetSchema } from '@delon/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Subscription } from 'rxjs';
import * as _ from 'underscore';
import { BlockUIService } from '../../services/block-ui.service';
import { CommonService } from '../../services/common.service';

@Component({
	selector: 'app-video-modal',
	templateUrl: './video-modal.component.html',
})
export class VideoModalComponent implements OnInit, OnDestroy {
	data: any = {};
	expoes: any[] = [];
	tags: any[] = [];

	fileList: any[] = [];
	uid = -1; // Negative is new file, positive is uploaded file

	@ViewChild('sf', { static: false }) sf: SFComponent;
	schema: SFSchema;

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.schema = {
			size: 'small',
			properties: {
				description_zh: {
					type: 'string',
					title: '视频说明',
					ui: {
						optional: '中文',
					},
					default: this.data.record.description
						? this.data.record.description.zh
						: null,
				},
				description_en: {
					type: 'string',
					title: '视频说明',
					ui: {
						optional: '英文',
					},
					default: this.data.record.description
						? this.data.record.description.en
						: null,
				},
			},
			required: ['description_zh', 'description_en'],
			ui: {
				spanLabelFixed: 140,
				grid: {
					span: 24,
				},
				size: 'small',
			},
		};
	}

	ngOnDestroy() {}

	isValidForm() {
		return this.data.record.id || (this.fileList && this.fileList.length);
	}

	beforeUploadFile = (file: any): boolean => {
		this.processFile(file, 0);
		return false;
	};

	processFile(file: any, idx: number) {
		this.getBase64(file).then((res: string) => {
			console.log(file);
			this.fileList = [
				{
					uid: '' + this.uid--,
					name: file.name,
					status: 'done',
					url: res,
					originFileObj: file,
				},
			];
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

	save() {
		// this.blkSrv.setBlockStatus(true);
		const postData = {
			...this.sf.value,
			tag: this.data.tag || '',
			source_id: this.data.source_id || '',
		};
		const formData = new FormData();
		// tslint:disable-next-line: forin
		for (const key in postData) {
			formData.append(key, postData[key]);
		}

		if (this.data.record.id) {
			formData.append('id', this.data.record.id);
			this.comSrv.updateVideo(formData).subscribe(
				(res: any) => {
					this.blkSrv.setBlockStatus(false);
					this.msgSrv.success(res.data.msg);
					this.modal.close(res);
				},
				(err: HttpErrorResponse) => {
					this.blkSrv.setBlockStatus(false);
				},
			);
		} else {
			const file = this.fileList[0];
			if (file.uid < 0) {
				formData.append('media', file.originFileObj);
				formData.append(
					'subtag',
					this.checkFileType(file.originFileObj.type, 'image')
						? 'image'
						: 'video',
				);
			}
			this.comSrv.createVideo(formData).subscribe(
				(res: any) => {
					this.blkSrv.setBlockStatus(false);
					this.msgSrv.success(res.data.msg);
					this.modal.close(res);
				},
				(err: HttpErrorResponse) => {
					this.blkSrv.setBlockStatus(false);
				},
			);
		}
	}

	close() {
		this.modal.destroy('Ok');
	}

	checkFileType(type: string, fileType: string) {
		return type.startsWith(fileType);
	}
}
