import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {
	SFComponent,
	SFDateWidgetSchema,
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
	selector: 'app-activity-modal',
	templateUrl: './activity-modal.component.html',
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
export class ActivityModalComponent implements OnInit {
	data: any = {};
	@ViewChild('sf', { static: false }) sf: SFComponent;
	schema: SFSchema;
	imageList: any[] = [];
	subtagList: any[] = ['cover_pc', 'cover_mobile'];
	del_asset_ids: any[] = [];
	uid = -1; // Negative is new file, positive is uploaded file
	previewImage: string | undefined = '';
	previewImageVisible = false;
	activityType: any[] = [];
	activitySignupUserType: any[] = [];
	expoes: any[] = [];
	categories: any[] = [];
	regions: any[] = [];
	content = '';

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.activityType = this.comSrv.activityType;
		this.activitySignupUserType = this.comSrv.activitySignupUserType;
		this.refreshSchema();
		this.categories = this.comSrv.getCommonData().newsTags;
		this.regions = this.comSrv.getCommonData().chinaRegions;
		this.expoes = this.comSrv.getCommonData().expoes;

		if (this.data.record.id) {
			this.getData();
		}
	}

	refreshSchema() {
		this.schema = {
			properties: {
				title_zh: {
					type: 'string',
					title: '活动标题',
					ui: {
						optional: '中文',
						grid: {
							span: 16,
						},
					},
					default: this.data.record?.title?.zh || '',
				},
				address_zh: {
					type: 'string',
					title: '活动地点',
					default: this.data.record?.address?.zh || '',
				},
				title_en: {
					type: 'string',
					title: '活动标题',
					ui: {
						optional: '英文',
						grid: {
							span: 16,
						},
					},
					default: this.data.record?.title?.en || '',
				},
				address_en: {
					type: 'string',
					title: '活动地点',
					default: this.data.record?.address?.en || '',
				},
				startdate: {
					type: 'string',
					title: '活动日期',
					ui: {
						widget: 'date',
						end: 'enddate',
					} as SFDateWidgetSchema,
					default: this.data.record?.startdate || null,
				},
				enddate: {
					type: 'string',
					ui: {
						widget: 'date',
						end: 'enddate',
					} as SFDateWidgetSchema,
					default: this.data.record?.enddate || null,
				},
				signupdate: {
					type: 'string',
					title: '截止日期',
					format: 'date',
					default: this.data.record?.signupdate || null,
				},
				subtag: {
					type: 'string',
					title: '活动类型',
					enum: this.activityType,
					ui: {
						widget: 'select',
					} as SFSelectWidgetSchema,
					default: this.data.record?.subtag || 0,
				},
				signup_user_type: {
					type: 'string',
					title: '报名对象',
					enum: this.activitySignupUserType,
					ui: {
						widget: 'select',
					} as SFSelectWidgetSchema,
					default: this.data.record?.signup_user_type || 0,
				},
				signup_available: {
					type: 'string',
					title: '能否报名',
					enum: [
						{ label: '是', value: 1 },
						{ label: '否', value: 0 },
					],
					ui: {
						widget: 'radio',
					} as SFRadioWidgetSchema,
					default: this.data.record?.signup_available || 0,
				},
				region_id: {
					type: 'string',
					title: '地区',
					enum: this.regions,
					ui: {
						widget: 'select',
					} as SFSelectWidgetSchema,
					default: this.data.record?.region_id || null,
				},
				tags: {
					type: 'string',
					title: '标签',
					enum: this.categories,
					ui: {
						widget: 'select',
						mode: 'tags',
						grid: {
							span: 16,
						},
					} as SFSelectWidgetSchema,
					default: this.data.record?.tags
						? _.pluck(this.data.record.tags, 'id')
						: null,
				},
				expoes: {
					type: 'string',
					title: '同期活动',
					enum: this.expoes,
					ui: {
						widget: 'select',
						mode: 'tags',
					} as SFSelectWidgetSchema,
					default: this.data.record?.expoes
						? _.pluck(this.data.record.expoes, 'id')
						: null,
				},
				cover: {
					type: 'string',
					title: '图标',
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
					default: this.data.record?.content || '',
				},
				overview: {
					type: 'string',
					title: '活动简介',
					ui: {
						widget: 'textarea',
						autosize: { minRows: 2, maxRows: 6 },
						grid: {
							span: 24,
						},
					},
					default: this.data.record?.overview || null,
				},
			},
			required: [
				'title_zh',
				'address_zh',
				'title_en',
				'address_en',
				'startdate',
				'enddate',
				'signupdate',
				'subtag',
				'signup_user_type',
				'signup_available',
				'region_id',
			],
			ui: {
				spanLabelFixed: 120,
				grid: {
					span: 8,
				},
				size: 'small',
			},
		};

		if (this.data.record.id) {
			this.subtagList.forEach((element, idx) => {
				const assetIdx = this.data.record.assets.findIndex(
					(item) => item.subtag === element,
				);
				if (assetIdx > -1) {
					this.imageList[idx] = [
						{
							uid: '' + this.data.record.assets[assetIdx].id,
							name: 'image.png',
							status: 'done',
							url: this.data.record.assets[assetIdx].url,
						},
					];
				}
			});
			this.content = this.data.record.content;
		}
	}

	getData() {
		this.blkSrv.setBlockStatus(true);
		this.comSrv.getDiscover(this.data.record.id).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.data.record = res.data;
				this.refreshSchema();
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	beforeUploadImage0 = (file: any): boolean => {
		this.processImage(file, 0);
		return false;
	};

	beforeUploadImage1 = (file: any): boolean => {
		this.processImage(file, 1);
		return false;
	};

	processImage(file: any, idx: number) {
		this.getBase64(file).then((res: string) => {
			this.imageList[idx] = [
				{
					uid: '' + this.uid--,
					name: 'image.png',
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

	handlePreviewImage = async (file: NzUploadFile) => {
		if (!file.url && !file.preview) {
			file.preview = await this.getBase64(file.originFileObj);
		}
		this.previewImage = file.url || file.preview;
		this.previewImageVisible = true;
	};

	removeAsset(file: NzUploadFile) {
		// if (+file.uid > 0) {
		// 	this.del_asset_ids.push(file.uid);
		// }
		// for (let index = 0; index < 2; index++) {
		// 	const idx = this.imageList[index].findIndex(
		// 		(element) => element.uid === file.uid,
		// 	);
		// 	if (idx > -1) {
		// 		this.imageList[index].splice(idx, 1);
		// 	}
		// }
	}

	isValidForm() {
		return (
			!!this.sf &&
			this.sf.valid &&
			this.imageList[0] &&
			this.imageList[0].length &&
			this.imageList[1] &&
			this.imageList[1].length
		);
	}

	save(value: any) {
		if (this.imageList[0].length && this.imageList[1].length) {
			const postData: any = {
				tag: 'activity',
				...value,
				subtag: this.activityType[value.subtag].db,
				expoes: value.expoes?.join(',') || '',
				content: this.content,
				del_asset_ids: this.del_asset_ids.join(','),
			};
			const formData = new FormData();
			this.imageList.forEach((element: any, idx: number) => {
				// Use file name to carry individual subtag
				const file = element[0];
				if (file.uid < 0) {
					formData.append(
						'covers[]',
						file.originFileObj,
						this.subtagList[idx] +
							'.' +
							file.originFileObj.name.split('.').pop(),
					);
				}
			});
			// tslint:disable-next-line: forin
			for (const key in postData) {
				formData.append(key, postData[key]);
			}
			this.blkSrv.setBlockStatus(true);
			if (this.data.record.id) {
				formData.append('id', this.data.record.id);
				this.comSrv.updateDiscover(formData).subscribe(
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
				this.comSrv.createDiscover(formData).subscribe(
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
	}

	close() {
		this.modal.destroy();
	}
}
