import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
	SFComponent,
	SFDateWidgetSchema,
	SFSchema,
	SFSelectWidgetSchema,
} from '@delon/form';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import * as _ from 'underscore';

@Component({
	selector: 'app-article-modal',
	templateUrl: './article-modal.component.html',
})
export class ArticleModalComponent implements OnInit, OnDestroy {
	data: any = {};
	categories: any[] = [];
	companies: any[] = [];
	tags: any[] = [];
	expoes: any[] = [];
	vips: any[] = [];
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
		this.status = this.comSrv.articleStatus.filter(
			(element) => element.value > 0,
		);
		this.vips = this.comSrv.getCommonData().vips;
		this.tags = this.comSrv.getCommonData().newsTags;
		this.categories = this.comSrv.getCommonData().newsCategories;
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
					} as SFSelectWidgetSchema,
					default: this.data.record.lang || 'zh',
				},
				title: {
					type: 'string',
					title: '标题',
					ui: {
						grid: {
							span: 16,
						},
					},
					default: this.data.record.title || '',
				},
				category_id: {
					type: 'string',
					title: '分类',
					enum: this.categories,
					ui: {
						widget: 'select',
					} as SFSelectWidgetSchema,
					default: this.data.record.category_id || null,
				},
				// company_id: {
				// 	type: 'string',
				// 	title: '企业',
				// 	ui: {
				// 		widget: 'select',
				// 		onSearch: (text: string) =>
				// 			new Promise((resolve) => {
				// 				this.comSrv
				// 					.getCompanies({
				// 						company_name: text,
				// 						pi: 1,
				// 						ps: 10,
				// 					})
				// 					.subscribe(
				// 						(res: any) => {
				// 							res.data.list.forEach((element) => {
				// 								element.value = element.id;
				// 								element.label = element.name.zh;
				// 							});
				// 							this.companies = res.data.list;
				// 							resolve(this.companies);
				// 						},
				// 						(err: HttpErrorResponse) => {
				// 							resolve([]);
				// 						},
				// 					);
				// 			}),
				// 	} as SFSelectWidgetSchema,
				// 	default: this.data.record.company_id || null,
				// },
				read_vip_lvl: {
					type: 'string',
					title: '权限',
					enum: this.vips,
					ui: {
						widget: 'select',
					} as SFSelectWidgetSchema,
					default: this.data.record.read_vip_lvl || null,
				},
				open_time: {
					type: 'string',
					title: '开放时间',
					format: 'date-time',
					ui: {
						widget: 'date',
					} as SFDateWidgetSchema,
					default: this.data.record.open_time
						? new Date(this.data.record.open_time)
						: null,
				},
				status: {
					type: 'string',
					title: '处理状态',
					enum: this.status,
					ui: {
						widget: 'select',
					} as SFSelectWidgetSchema,
					default: this.data.record.status,
				},
				expo_id: {
					type: 'string',
					title: '展会名称',
					enum: this.expoes,
					ui: {
						widget: 'select',
						visibleIf: {
							category_id: (value: any) =>
								this.categories.length &&
								this.categories.some(
									(element) =>
										element.id === value &&
										element.subtag === 'expo_news',
								),
						},
						showRequired: true,
						validator: (val) =>
							!val
								? [
										{
											keyword: 'required',
											message: '必填项',
										},
								  ]
								: [],
						grid: {
							span: 8,
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
						autosize: { minRows: 1, maxRows: 6 },
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
						autosize: { minRows: 1, maxRows: 6 },
						grid: {
							span: 24,
						},
					},
					default: this.data.record.overview || null,
				},
			},
			required: ['lang', 'title', 'category_id', 'read_vip_lvl'],
			// if: {
			// 	properties: {
			// 		category_id: { enum: [this.comSrv.industry_news_id] },
			// 	},
			// },
			// then: {
			// 	required: ['company_id'],
			// },
			// else: {
			// 	required: [],
			// },
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
		const postData = {
			...this.sf.value,
		};
		postData.tag = 'article';
		postData.content = this.data.record.content;
		const category = this.categories.find(
			(element) => element.value === postData.category_id,
		);
		if (category.subtag) {
			postData.subtag = category.subtag;
		}

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
