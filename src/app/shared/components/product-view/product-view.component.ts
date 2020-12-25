import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { SFComponent, SFSchema, SFSelectWidgetSchema } from '@delon/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Subscription } from 'rxjs';

// Custom services
import { BlockUIService } from '../../services/block-ui.service';
import { CommonService } from '../../services/common.service';

@Component({
	selector: 'app-product-view',
	templateUrl: './product-view.component.html',
	styleUrls: ['./product-view.component.less'],
})
export class ProductViewComponent implements OnInit, OnDestroy {
	data: any = {};
	selectedTab = 0;
	status: any[] = [];
	sellingStatus: any[] = [];
	units: any[] = [];
	categories: any[] = [];
	customCategory: any[] = [];

	videoList: NzUploadFile[] = [];
	imageList: NzUploadFile[] = [];
	del_asset_ids: any[] = [];
	uid = -1; // Negative is new file, positive is uploaded file
	previewImage: string | undefined = '';
	previewImageVisible = false;
	previewVideo: SafeUrl | undefined = '';
	previewVideoVisible = false;

	@ViewChild('sf', { static: false }) sf: SFComponent;
	schema: SFSchema;

	selectedDescriptionTab = 0;
	descriptionTabs: string[] = [
		'PC端-中文',
		'PC端-英文',
		'移动端-中文',
		'移动端-英文',
	];
	descriptions: string[];

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
		private sanitizer: DomSanitizer,
	) {}

	ngOnInit() {
		this.status = this.comSrv.productStatus;
		this.sellingStatus = this.comSrv.productSellingStatus;
		this.units = this.comSrv.getCommonData().units;
		this.categories = this.comSrv.getCommonData().productCategories;
		this.blkSrv.setBlockStatus(true);
		this.comSrv
			.getProductCustomCategories({
				company_id: this.data.record.company.id,
			})
			.subscribe(
				(res: any) => {
					this.blkSrv.setBlockStatus(false);
					res.data.list.forEach((element) => {
						this.customCategory.push({
							label:
								element.name.zh ||
								element.name.en ||
								element.id,
							value: element.id,
						});
					});
					const customCategoryProperty = this.sf.getProperty(
						'/custom_category_id',
					);
					customCategoryProperty.schema.enum = this.customCategory;
					customCategoryProperty.widget.reset(
						this.data.record.custom_category_id,
					);
					this.sf.refreshSchema();
				},
				(err: HttpErrorResponse) => {
					this.blkSrv.setBlockStatus(false);
				},
			);

		this.refresh();
		this.getData();
	}

	ngOnDestroy() {}

	getData() {
		this.blkSrv.setBlockStatus(true);
		this.comSrv.getProduct(this.data.record.id).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.data.record = res.data;
				this.refresh();
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	refresh() {
		// For category cascader
		const categoryTree = this.fetchCategoryTree(
			[],
			this.data.record.category,
		);

		this.schema = {
			size: 'small',
			properties: {
				serial: {
					type: 'string',
					title: '序列号',
					default: this.data.record.serial,
				},
				status: {
					type: 'string',
					title: '审核状态',
					enum: this.status,
					ui: {
						widget: 'select',
					} as SFSelectWidgetSchema,
					default: this.data.record.status,
				},
				selling_status: {
					type: 'string',
					title: '上架状态',
					enum: this.sellingStatus,
					ui: {
						widget: 'select',
					} as SFSelectWidgetSchema,
					default: this.data.record.selling_status,
				},
				name_zh: {
					type: 'string',
					title: '名称',
					ui: {
						optional: '中文',
						grid: {
							span: 16,
						},
					},
					default: this.data.record.name.zh,
				},
				brand_zh: {
					type: 'string',
					title: '品牌',
					default: this.data.record.brand.zh,
				},
				name_en: {
					type: 'string',
					title: '名称',
					ui: {
						optional: '英文',
						grid: {
							span: 16,
						},
					},
					default: this.data.record.name.en,
				},
				brand_en: {
					type: 'string',
					title: '品牌',
					default: this.data.record.brand.en,
				},
				category: {
					type: 'number',
					title: '产品分类',
					enum: this.categories,
					ui: {
						widget: 'cascader',
						grid: {
							span: 16,
						},
					},
					default: categoryTree,
				},
				custom_category_id: {
					type: 'string',
					title: '自定义分类:',
					enum: this.customCategory,
					ui: {
						widget: 'select',
					} as SFSelectWidgetSchema,
					default: this.data.record.custom_category_id,
				},
				price: {
					type: 'string',
					title: '价格',
					default: this.data.record.price,
					ui: {
						addOnAfter: '元/个',
					},
				},
				unit_id: {
					type: 'string',
					title: '单位',
					enum: this.units,
					ui: {
						widget: 'select',
					} as SFSelectWidgetSchema,
					default: this.data.record.unit.id,
				},
				min_quantity: {
					type: 'string',
					title: '最小起订量',
					default: this.data.record.min_quantity,
				},
				is_pindan: {
					type: 'boolean',
					title: '可否拼单',
					default: this.data.record.is_pindan,
				},
				is_only_buyer: {
					type: 'boolean',
					title: '仅限自己买家查看',
					default: this.data.record.is_only_buyer,
				},
				is_recommend: {
					type: 'boolean',
					title: '是否推荐',
					default: this.data.record.is_recommend,
				},
				keyword_zh: {
					type: 'string',
					title: '关键词',
					ui: {
						optional: '中文',
						grid: {
							span: 24,
						},
					},
					default: this.data.record.keyword.zh,
				},
				keyword_en: {
					type: 'string',
					title: '关键词',
					ui: {
						optional: '英文',
						grid: {
							span: 24,
						},
					},
					default: this.data.record.keyword.en,
				},
			},
			required: [
				'serial',
				'status',
				'selling_status',
				'name_zh',
				'brand_zh',
				'name_en',
				'brand_en',
				'category',
				'custom_category_id',
				'price',
				'unit_id',
				'min_quantity',
				'is_pindan',
				'is_only_buyer',
				'is_recommend',
				'keyword_zh',
				'keyword_en',
			],
			ui: {
				spanLabelFixed: 140,
				grid: {
					span: 8,
				},
				size: 'small',
			},
		};

		this.refreshDescription();

		this.data.record.assets.forEach((element) => {
			if (element.subtag === 'image') {
				this.imageList.push({
					uid: element.id,
					name: element.id + '.png',
					status: 'done',
					url: element.url,
				});
			} else if (element.subtag === 'video') {
				this.videoList.push({
					uid: element.id,
					name: element.id + '.png',
					status: 'done',
					url: element.url,
					thumbUrl: 'assets/img/video.png',
				});
			}
		});
	}

	isValidForm() {
		if (this.selectedTab === 0) {
			return !!this.sf && this.sf.valid;
		} else if (this.selectedTab === 1) {
			return true;
		}
	}

	fetchCategoryTree(rlt: number[] = [], value: any = {}) {
		if (!!value && !!value.id) {
			return this.fetchCategoryTree([value.id].concat(rlt), value.parent);
		} else {
			return rlt;
		}
	}

	refreshDescription() {
		this.descriptions = [
			this.data.record.description?.zh || '',
			this.data.record.description?.en || '',
			this.data.record.description?.zh || '',
			this.data.record.description?.en || '',
		];
	}

	beforeUploadImage = (file: any): boolean => {
		console.log('Before upload', file);
		this.getBase64(file).then((res: string) => {
			this.imageList = this.imageList.concat({
				uid: '' + this.uid--,
				name: 'image.png',
				status: 'done',
				url: res,
				originFileObj: file,
			});
		});
		return false;
	};

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

	beforeUploadVideo = (file: any): boolean => {
		console.log('Before upload', file);
		this.videoList = this.videoList.concat({
			uid: '' + this.uid--,
			name: file.name,
			status: 'done',
			thumbUrl: 'assets/img/video.png',
			originFileObj: file,
		});
		return false;
	};

	handlePreviewVideo = async (file: NzUploadFile) => {
		if (file.url) {
			this.previewVideo = file.url;
		} else {
			this.previewVideo = this.sanitizer.bypassSecurityTrustUrl(
				URL.createObjectURL(file.originFileObj),
			);
		}
		setTimeout(() => (this.previewVideoVisible = true));
	};

	removeAsset = (file: NzUploadFile): boolean => {
		console.log('Remove asset', file);
		if (+file.uid > 0) {
			this.del_asset_ids.push(file.uid);
		}
		return true;
	};

	selectTab(idx: number) {
		this.selectedTab = idx;
	}

	save() {
		if (this.selectedTab === 0) {
			this.blkSrv.setBlockStatus(true);
			const postData = this.sf.value;
			postData.main = 'ok';
			postData.id = this.data.record.id;
			postData.category_id =
				postData.category[postData.category.length - 1] || null;
			postData.is_pindan = postData.is_pindan ? 1 : 0;
			postData.is_only_buyer = postData.is_only_buyer ? 1 : 0;
			postData.is_recommend = postData.is_recommend ? 1 : 0;
			postData.del_asset_ids = this.del_asset_ids.length
				? this.del_asset_ids
				: null;
			const formData = new FormData();
			this.imageList.forEach((file: any) => {
				if (file.uid < 0) {
					formData.append('images[]', file.originFileObj);
				}
			});
			this.videoList.forEach((file: any) => {
				if (file.uid < 0) {
					formData.append('videos[]', file.originFileObj);
				}
			});
			// tslint:disable-next-line: forin
			for (const key in postData) {
				formData.append(key, postData[key]);
			}

			this.comSrv.updateProduct(formData).subscribe(
				(res: any) => {
					this.blkSrv.setBlockStatus(false);
					this.msgSrv.success(res.data.msg);
					this.modal.close(res);
				},
				(err: HttpErrorResponse) => {
					this.blkSrv.setBlockStatus(false);
				},
			);
		} else if (this.selectedTab === 1) {
			this.blkSrv.setBlockStatus(true);
			const postData = {
				id: this.data.record.id,
				description_zh: this.descriptions[0],
				description_en: this.descriptions[1],
			};

			this.comSrv.updateProduct(postData).subscribe(
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
