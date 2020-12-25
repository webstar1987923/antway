import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SFComponent, SFSchema, SFSelectWidgetSchema } from '@delon/form';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
	selector: 'app-general-modal',
	templateUrl: './general-modal.component.html',
})
export class GeneralModalComponent implements OnInit {
	data: any = {};
	@ViewChild('sf', { static: false }) sf: SFComponent;
	schema: SFSchema;
	contentTypes: any[] = [];
	specialNews: any[] = [];

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.specialNews = this.comSrv.specialNews;
		this.schema = {
			properties: {
				name_zh: {
					type: 'string',
					title: '中文分类名称',
					maxLength: 50,
					default: this.data.record && this.data.record.name_zh,
				},
				name_en: {
					type: 'string',
					title: '英文分类名称',
					maxLength: 50,
					default: this.data.record && this.data.record.name_en,
				},
			},
			required: ['name_zh', 'name_en'],
		};
		if (this.data.tag === 'news') {
			this.schema.properties.is_postable = {
				type: 'boolean',
				title: '发布文章可能',
				default: this.data.record && this.data.record.is_postable,
			};
			this.schema.properties.subtag = {
				type: 'string',
				title: '特别新闻',
				enum: this.specialNews,
				ui: {
					widget: 'select',
				} as SFSelectWidgetSchema,
				default: this.data.record.subtag || null,
			};
		}
		if (this.data.tag === 'expo_menu') {
			this.contentTypes = [];
			this.processExpoContentCategory(
				this.comSrv.getCommonData().expoContentCategories,
			);
			this.schema.properties.url = {
				type: 'string',
				title: 'PC网址',
				default: this.data.record && this.data.record.url,
			};
			this.schema.properties.url_m = {
				type: 'string',
				title: '移动端网址',
				default: this.data.record && this.data.record.url_m,
			};
			this.schema.properties.is_blank = {
				type: 'boolean',
				title: 'blank',
				default: this.data.record && this.data.record.is_blank,
			};
			this.schema.properties.category_id = {
				type: 'string',
				title: '展会内容',
				enum: this.contentTypes,
				ui: {
					widget: 'select',
				} as SFSelectWidgetSchema,
				default: this.data.record.category_id || null,
			};
		}
	}

	processExpoContentCategory(value) {
		value.forEach((element) => {
			if (element.children && element.children.length) {
				this.processExpoContentCategory(element.children);
			} else {
				this.contentTypes.push({
					value: element.id,
					label: element.name.zh,
				});
			}
		});
	}

	save(value: any) {
		this.blkSrv.setBlockStatus(true);
		const postData: any = {
			...value,
			pid: this.data.record.pid || 0,
		};
		if (!this.data.record.pid) {
			postData.companies = value.companies;
		}
		if (this.data.record.id) {
			postData.id = this.data.record.id;
			this.comSrv.updateCategory(postData).subscribe(
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
			postData.tag = this.data.tag;
			this.comSrv.createCategory(postData).subscribe(
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
