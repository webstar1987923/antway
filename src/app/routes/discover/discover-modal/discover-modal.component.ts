import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SFComponent, SFSchema, SFSelectWidgetSchema } from '@delon/form';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Subscription } from 'rxjs';
import * as _ from 'underscore';

@Component({
	selector: 'app-discover-modal',
	templateUrl: './discover-modal.component.html',
})
export class DiscoverModalComponent implements OnInit, OnDestroy {
	data: any = {};
	expoes: any[] = [];
	tags: any[] = [];
	status: any[] = [];

	imageList: any[] = [];
	subtag = 'cover';
	del_asset_ids: any[] = [];
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
		this.status = this.comSrv.discoverStatus.filter(
			(element) => element.value > 0,
		);
		this.tags = this.comSrv.getCommonData().newsTags;
		this.expoes = this.comSrv.getCommonData().expoes;

		if (!this.data.record.id) {
			// default = 通过
			this.data.record.status = 2;
			this.data.record.content = '';
		} else {
			this.data.record.assets.forEach((element) => {
				if (element.subtag === this.subtag) {
					this.imageList.push({
						uid: element.id,
						name: element.id + '.png',
						status: 'done',
						url: element.url,
					});
				}
			});
		}

		this.schema = {
			size: 'small',
			properties: {
				lang: {
					type: 'string',
					title: '语言',
					enum: [
						{
							label: '中文',
							value: 'zh',
						},
						{
							label: '英文',
							value: 'en',
						},
					],
					ui: {
						widget: 'select',
						grid: {
							span: 8,
						},
					} as SFSelectWidgetSchema,
					default: this.data.record.lang || 'zh',
				},
				title: {
					type: 'string',
					title: '标题',
					ui: {
						grid: {
							span: 17,
						},
					},
					default: this.data.record.title || '',
				},
				expo_id: {
					type: 'string',
					title: '展会名称',
					enum: this.expoes,
					ui: {
						widget: 'select',
						grid: {
							span: 7,
						},
					} as SFSelectWidgetSchema,
					default: this.data.record.expo_id || null,
				},
				tags: {
					type: 'string',
					title: '标签',
					enum: this.tags,
					ui: {
						widget: 'select',
						mode: 'tags',
						grid: {
							span: 24,
						},
					} as SFSelectWidgetSchema,
					default: this.data.record.tags
						? _.pluck(this.data.record.tags, 'id')
						: null,
				},
				status: {
					type: 'string',
					title: '处理状态',
					enum: this.status,
					ui: {
						widget: 'select',
						grid: {
							span: 8,
						},
					} as SFSelectWidgetSchema,
					default: this.data.record.status,
				},
				cover: {
					type: 'string',
					title: '封面图',
					ui: {
						widget: 'custom',
						grid: {
							span: 24,
						},
					},
				},
				content: {
					type: 'string',
					title: '内容',
					ui: {
						widget: 'custom',
						grid: {
							span: 24,
						},
					},
					default: this.data.record.content || '',
				},
				description: {
					type: 'string',
					title: 'Description',
					ui: {
						widget: 'textarea',
						autosize: { minRows: 2, maxRows: 6 },
						grid: {
							span: 24,
						},
					},
					default: this.data.record.description || null,
				},
				overview: {
					type: 'string',
					title: '简介',
					ui: {
						widget: 'textarea',
						autosize: { minRows: 2, maxRows: 6 },
						grid: {
							span: 24,
						},
					},
					default: this.data.record.overview || null,
				},
			},
			required: ['lang', 'title', 'expo_id'],
			ui: {
				spanLabelFixed: 140,
				grid: {
					span: 8,
				},
				size: 'small',
			},
		};
	}

	ngOnDestroy() {}

	isValidForm() {
		return this.imageList && this.imageList.length;
	}

	beforeUploadImage = (file: any): boolean => {
		this.processImage(file, 0);
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
			this.imageList = this.imageList.concat([nzFile]);
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

	removeAsset = (file: NzUploadFile): boolean => {
		if (+file.uid > 0) {
			this.del_asset_ids.push(file.uid);
		}
		const idx = this.imageList.findIndex(
			(element) => element.uid === file.uid,
		);
		if (idx > -1) {
			this.imageList.splice(idx, 1);
		}
		return true;
	};

	save() {
		this.blkSrv.setBlockStatus(true);
		const postData = this.sf.value;
		postData.tag = 'discover';
		postData.content = this.data.record.content;

		postData.del_asset_ids = this.del_asset_ids.length
			? this.del_asset_ids
			: null;
		const formData = new FormData();
		this.imageList.forEach((element, idx) => {
			const file = this.imageList[idx];
			if (file.uid < 0) {
				formData.append(
					'covers[]',
					file.originFileObj,
					this.subtag +
						'.' +
						file.originFileObj.name.split('.').pop(),
				);
			}
		});
		// tslint:disable-next-line: forin
		for (const key in postData) {
			formData.append(key, postData[key]);
		}

		if (this.data.record.id) {
			formData.append('id', this.data.record.id);
			this.comSrv.updateDiscover(formData).subscribe(
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
			this.comSrv.createDiscover(formData).subscribe(
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
}
