import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { XlsxService } from '@delon/abc/xlsx';
import { SFComponent, SFSchema, SFTextWidgetSchema } from '@delon/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import * as _ from 'underscore';
import { CommonService } from '../../services/common.service';

@Component({
	selector: 'app-message-modal',
	template: `
		<div class="modal-header">
			<div class="modal-title">发送消息</div>
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
export class MessageModalComponent implements OnInit {
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
				receivers: {
					type: 'string',
					title: '收件人',
					maxLength: 500,
					ui: {
						widget: 'text',
						defaultText: _.reduce(
							this.data.users,
							(acc, val: any) => {
								return (
									(acc ? `${acc}, ` : '') +
									(val.name ? val.name.zh || '-' : '-')
								);
							},
							'',
						),
					} as SFTextWidgetSchema,
				},
				title: { type: 'string', title: '标题', maxLength: 50 },
				content: {
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

	save(value: any) {
		this.loading = true;
		value.receiver_ids = _.pluck(this.data.users, 'id').join(',');
		this.comSrv.createMessage(value).subscribe(
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
