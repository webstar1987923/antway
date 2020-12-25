import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
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

@Component({
	selector: 'app-site-ads-modal',
	templateUrl: 'site-ads-modal.component.html',
})
export class SiteAdsModalComponent implements OnInit {
	data: any = {};
	@ViewChild('sf', { static: false }) sf: SFComponent;
	schema: SFSchema;
	fileList: any[] = [[], []];
	del_asset_ids: any[] = [];
	subtag = 'image';
	subtagList: string[] = ['zh', 'en'];
	uid = -1; // Negative is new file, positive is uploaded file
	categories: any[] = [];
	// siteAdsType: any[];

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		// this.siteAdsType = this.comSrv.siteAdsType;
		this.categories = this.comSrv.getCommonData().adsCategories;

		// this.blkSrv.setBlockStatus(true);
		// const promise1 = new Promise((resolve) => {
		// 	this.comSrv.getCategory({ tag: 'advertising' }).subscribe(
		// 		(res: any) => {
		// 			this.categories = this.fetchCategoryChildren(res.data.list);
		// 			this.schema.properties.category_id.enum = this.categories;
		// 			resolve();
		// 		},
		// 		(err: HttpErrorResponse) => {
		// 			resolve();
		// 		},
		// 	);
		// });

		// Promise.all([promise1]).then((values) => {
		// 	this.sf.refreshSchema();
		// 	this.blkSrv.setBlockStatus(false);
		// });

		this.schema = {
			properties: {
				// device: {
				// 	type: 'string',
				// 	title: '客户端',
				// 	enum: this.siteAdsType,
				// 	ui: {
				// 		widget: 'select',
				// 	},
				// 	default: this.data.record.device || 0,
				// },
				category_id: {
					type: 'number',
					title: '展示页面',
					enum: this.categories,
					ui: {
						widget: 'select',
						grid: {
							span: 16,
						},
					} as SFSelectWidgetSchema,
					default: this.data.record?.category?.id || null,
				},
				description_zh: {
					type: 'string',
					title: '说明',
					ui: {
						optional: '中文',
					},
					default: this.data.record.description
						? this.data.record.description.zh
						: '',
				},
				description_en: {
					type: 'string',
					title: '说明',
					ui: {
						optional: '英文',
					},
					default: this.data.record.description
						? this.data.record.description.en
						: '',
				},
			},
			required: [
				// 'device',
				'category_id',
			],
			ui: {
				spanLabelFixed: 120,
				grid: { span: 24 },
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
	}

	isValidForm() {
		return (
			this.fileList[0] &&
			this.fileList[0].length &&
			this.fileList[1] &&
			this.fileList[1].length
		);
	}

	// fetchCategoryChildren(value) {
	// 	value.forEach((element) => {
	// 		element.value = element.id;
	// 		element.label = element.name.zh;
	// 		element.parent = element.pid;
	// 		element.isLeaf = !element.children.length;
	// 		element.children = this.fetchCategoryChildren(element.children);
	// 	});
	// 	return value;
	// }

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
			this.fileList[idx] = this.fileList[idx].concat([
				{
					uid: '' + this.uid--,
					name: file.name,
					status: 'done',
					url: res,
					originFileObj: file,
					redirect_url: '',
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
		const postData = {
			...value,
			del_asset_ids: this.del_asset_ids.length
				? this.del_asset_ids
				: null,
		};
		const formData = new FormData();
		const redirect_urls = {};
		this.fileList.forEach((element, idx) => {
			element.forEach((item) => {
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
				redirect_urls[item.uid] = {
					subtag: this.subtagList[idx],
					redirect_url: item.redirect_url,
				};
			});
		});
		formData.append('redirect_urls', JSON.stringify(redirect_urls));
		// tslint:disable-next-line: forin
		for (const key in postData) {
			formData.append(key, postData[key]);
		}
		this.blkSrv.setBlockStatus(true);
		if (this.data.record.id) {
			formData.append('id', this.data.record.id);
			this.comSrv.updateSiteAds(formData).subscribe(
				(res: any) => {
					this.blkSrv.setBlockStatus(false);
					this.msgSrv.success('保存成功');
					this.modal.close('ok');
				},
				(err: HttpErrorResponse) => {
					this.blkSrv.setBlockStatus(false);
				},
			);
		} else {
			this.comSrv.createSiteAds(formData).subscribe(
				(res: any) => {
					this.blkSrv.setBlockStatus(false);
					this.msgSrv.success('保存成功');
					this.modal.close('ok');
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
