import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { XlsxService } from '@delon/abc/xlsx';
import { SFComponent, SFSchema, SFUploadWidgetSchema } from '@delon/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import * as _ from 'underscore';
import { CommonService } from '../../services/common.service';

@Component({
	selector: 'app-email-modal',
	template: `
		<div class="modal-header">
			<div class="modal-title">发送邮件</div>
		</div>
		<sf
			#sf
			mode="edit"
			[schema]="schema"
			[formData]="data.record"
			button="none"
		>
			<div class="modal-footer">
				<button nz-button type="button" (click)="close()">取 消</button>
				<button
					nz-button
					type="submit"
					[nzType]="'primary'"
					[nzLoading]="loading"
					(click)="save(sf.value)"
					[disabled]="!sf.valid"
				>
					确 定
				</button>
			</div>
		</sf>
	`,
})
export class EmailModalComponent implements OnInit {
	loading = false;
	data: any = {};
	schema: SFSchema;
	fileList: NzUploadFile[] = [];
	@ViewChild('sf', { static: true }) sf: SFComponent;

	constructor(
		private cdr: ChangeDetectorRef,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
		private xlsx: XlsxService,
	) {}

	ngOnInit() {
		console.log(this.data);
		this.schema = {
			properties: {
				to: {
					type: 'string',
					title: '收件人',
					maxLength: 500,
					ui: {
						widget: 'textarea',
						autosize: { minRows: 1, maxRows: 6 },
					},
				},
				file: {
					type: 'string',
					title: '批量发送',
					ui: {
						widget: 'upload',
						fileList: this.fileList,
						accept: ['.csv', '.xls', '.xlsx'],
						resReName: 'resource_id',
						urlReName: 'url',
						beforeUpload: (file: NzUploadFile) =>
							this.fetchData(file),
					} as SFUploadWidgetSchema,
				},
				subject: { type: 'string', title: '标题', maxLength: 50 },
				message: {
					type: 'string',
					title: '内容',
					ui: {
						widget: 'quill',
						autosize: { minRows: 2, maxRows: 6 },
					},
				},
			},
			required: ['to', 'subject', 'message'],
		};
	}

	validateEmail(email) {
		const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	}

	fetchData(file) {
		this.fileList = this.fileList.concat(file);
		this.xlsx.import(file).then((res: any) => {
			const emailList = [];
			for (const key in res) {
				if (Object.prototype.hasOwnProperty.call(res, key)) {
					const data = res[key];
					if (data && data.length) {
						const emailIdx = data[0].findIndex(
							(element) => element === '邮箱',
						);
						if (emailIdx != null) {
							data.forEach((element) => {
								if (this.validateEmail(element[emailIdx])) {
									emailList.push(element[emailIdx]);
								}
							});
						}
					}
				}
			}
			this.data.record.to = _.unique(
				this.data.record.to.split(',').concat(emailList),
			)
				.filter((element) => this.validateEmail(element))
				.join(',');
			this.sf.setValue('/to', this.data.record.to);
			console.log(this.data.record.to);
			this.cdr.detectChanges();
		});
		return false;
	}

	save(value: any) {
		this.loading = true;
		this.comSrv.sendEmail(value).subscribe(
			(res: any) => {
				this.loading = false;
				this.msgSrv.success(res.data.msg);
				this.modal.close(value);
			},
			(err: HttpErrorResponse) => {
				this.loading = false;
			},
		);
	}

	close() {
		this.modal.destroy();
	}
}
