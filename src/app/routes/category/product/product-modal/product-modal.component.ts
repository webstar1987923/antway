import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { SFComponent, SFSchema, SFSelectWidgetSchema } from '@delon/form';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzUploadFile } from 'ng-zorro-antd/upload';

@Component({
	selector: 'app-product-modal',
	templateUrl: './product-modal.component.html',
	styles: [
		`
			.image-upload img {
				height: 40px;
				width: 40px;
			}
		`,
	],
})
export class ProductModalComponent implements OnInit {
	data: any = {};
	@ViewChild('sf', { static: false }) sf: SFComponent;
	schema: SFSchema;
	imageList: any[] = [];
	subtagList: any[] = ['icon_normal', 'icon_selected'];
	uid = -1; // Negative is new file, positive is uploaded file
	previewImage: string | undefined = '';
	previewImageVisible = false;
	companies: any[] = [];

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.schema = {
			properties: {
				name_zh: {
					type: 'string',
					title: '中文分类名称',
					maxLength: 50,
				},
				name_en: {
					type: 'string',
					title: '英文分类名称',
					maxLength: 50,
				},
			},
			required: ['name_zh', 'name_en'],
			ui: {
				spanLabelFixed: 120,
			},
		};
		if (!this.data.record.pid) {
			this.schema.properties.companies = {
				type: 'string',
				title: '推荐企业名称',
				enum: this.companies,
				ui: {
					widget: 'select',
					mode: 'tags',
				} as SFSelectWidgetSchema,
				default: this.data.record.companies || null,
			};
			this.getCompanies();
		}
		if (this.data.record.id && this.data.record.assets) {
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
		}
	}

	getCompanies() {
		this.blkSrv.setBlockStatus(true);
		this.comSrv.getCompanies().subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				console.log('Company list: ', res.data.list);
				this.companies = [];
				res.data.list.forEach((element) => {
					this.companies.push({
						value: element.id,
						label: element.name.zh,
					});
				});
				// this.companies = res.data.list;
				this.schema.properties.companies.enum = this.companies;
				this.sf.refreshSchema();
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

	iconUploaded() {
		return (
			this.data.record.pid ||
			(this.imageList[0] &&
				this.imageList[0].length &&
				this.imageList[1] &&
				this.imageList[1].length)
		);
	}

	save(value: any) {
		const postData: any = {
			pid: this.data.record.pid || 0,
			name_zh: value.name_zh,
			name_en: value.name_en,
		};
		if (!this.data.record.pid) {
			postData.companies = value.companies;
		}
		const formData = new FormData();
		this.imageList.forEach((element: any, idx: number) => {
			// Use file name to carry individual subtag
			const file = element[0];
			if (file.uid < 0) {
				formData.append(
					'icons[]',
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
			this.comSrv.updateCategory(formData).subscribe(
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
			formData.append('tag', 'product');
			this.comSrv.createCategory(formData).subscribe(
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
