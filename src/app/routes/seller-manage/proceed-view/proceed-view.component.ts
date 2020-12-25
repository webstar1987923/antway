import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { SFComponent, SFSchema, SFSelectWidgetSchema } from '@delon/form';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-proceed-view',
	templateUrl: './proceed-view.component.html',
})
export class ProceedViewComponent implements OnInit, OnDestroy {
	loading = false;
	data: any = {};
	status: any[] = [];
	fileList: any[] = [];
	del_asset_ids: any[] = [];
	uid = -1; // Negative is new file, positive is uploaded file

	@ViewChild('sf', { static: false }) sf: SFComponent;
	schema: SFSchema;

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
		private sanitizer: DomSanitizer,
	) {}

	ngOnInit() {
		this.status = this.comSrv.expoProceedStatus;

		this.schema = {
			properties: {
				logo: {
					type: 'string',
					title: '公司LOGO',
					ui: {
						widget: 'custom',
						grid: {
							span: 24,
						},
					},
				},
				company_zh: {
					type: 'string',
					title: '公司名称',
					ui: {
						optional: '中文',
					},
					default: this.data.record.company.zh,
				},
				company_en: {
					type: 'string',
					title: '公司名称',
					ui: {
						optional: '英文',
					},
					default: this.data.record.company.en,
				},
				hallname: {
					type: 'string',
					title: '展位号',
					default: this.data.record.hallname,
				},
				summary_zh: {
					type: 'string',
					title: '公司介绍',
					ui: {
						widget: 'textarea',
						autosize: { minRows: 2, maxRows: 6 },
						optional: '中文',
					},
					default: this.data.record.summary.zh,
				},
				summary_en: {
					type: 'string',
					title: '公司介绍',
					ui: {
						widget: 'textarea',
						autosize: { minRows: 2, maxRows: 6 },
						optional: '英文',
					},
					default: this.data.record.summary.en,
				},
				contact_email: {
					type: 'string',
					title: '邮编',
					default: this.data.record.contact_email,
				},
				contact_addr_zh: {
					type: 'string',
					title: '地址',
					ui: {
						optional: '中文',
					},
					default: this.data.record.contact_addr.zh,
				},
				contact_addr_en: {
					type: 'string',
					title: '地址',
					ui: {
						optional: '英文',
					},
					default: this.data.record.contact_addr.en,
				},
				contact_phone: {
					type: 'string',
					title: '电话',
					ui: {
						grid: { span: 8 },
					},
					default: this.data.record.contact_phone,
				},
				contact_fax: {
					type: 'string',
					title: '传真',
					ui: {
						grid: { span: 8 },
					},
					default: this.data.record.contact_fax,
				},
				contact_postal: {
					type: 'string',
					title: '邮箱',
					ui: {
						grid: { span: 8 },
					},
					default: this.data.record.contact_postal,
				},
				contact_website: {
					type: 'string',
					title: '公司网址',
					ui: {
						grid: { span: 16 },
					},
					default: this.data.record.contact_website,
				},
				status: {
					type: 'string',
					title: '处理状态',
					enum: this.status,
					ui: {
						widget: 'select',
						grid: { span: 8 },
					} as SFSelectWidgetSchema,
					default: this.data.record.status,
				},
			},
			required: [
				'company_zh',
				'company_en',
				'hallname',
				'summary_zh',
				'summary_en',
				'contact_email',
				'contact_addr_zh',
				'contact_addr_en',
				'contact_phone',
				'contact_fax',
				'contact_postal',
				'contact_website',
				'status',
			],
			ui: {
				spanLabelFixed: 120,
				grid: {
					span: 24,
				},
				size: 'small',
			},
		};

		if (this.data.record.id) {
			if (this.data.record.logo) {
				this.fileList = [
					{
						uid: '' + this.data.record.logo.id,
						name: 'image.png',
						status: 'done',
						url: this.data.record.logo.url,
					},
				];
			} else {
				this.fileList = [];
			}
		}
	}

	ngOnDestroy() {}

	beforeUploadFile = (file: any): boolean => {
		this.processImage(file, 0);
		return false;
	};

	processImage(file: any, idx: number) {
		this.getBase64(file).then((res: string) => {
			this.fileList = [
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

	save(value) {
		this.blkSrv.setBlockStatus(true);
		const postData: any = {
			...value,
			id: this.data.record.id,
		};
		const formData = new FormData();
		this.fileList.forEach((element: any, idx: number) => {
			// Use file name to carry individual subtag
			const file = element;
			if (file.uid < 0) {
				formData.append(
					'logo[]',
					file.originFileObj,
					'logo' + '.' + file.originFileObj.name.split('.').pop(),
				);
			}
		});
		// tslint:disable-next-line: forin
		for (const key in postData) {
			formData.append(key, postData[key]);
		}
		this.comSrv.updateExpoProceed(formData).subscribe(
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

	close() {
		this.modal.destroy('Ok');
	}
}
