import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SFSchema } from '@delon/form';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
	selector: 'app-expo-type-modal',
	template: `
		<div class="modal-header">
			<div class="modal-title">
				{{ data.record.id ? '修改' : '新增' }}展会名称
			</div>
		</div>
		<sf #sf mode="edit" [schema]="schema" button="none">
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
export class ExpoTypeModalComponent implements OnInit {
	loading = false;
	data: any = {};
	schema: SFSchema;

	constructor(
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.schema = {
			properties: {
				name_zh: {
					type: 'string',
					title: '展会名称',
					ui: {
						optional: '中文',
						placeholder: '请输入中文展会名称',
					},
					default: this.data.record.name
						? this.data.record.name.zh
						: '',
				},
				name_en: {
					type: 'string',
					title: '展会名称',
					ui: {
						optional: '英文',
						placeholder: '请输入英文展会名称',
					},
					default: this.data.record.name
						? this.data.record.name.en
						: '',
				},
				description_zh: {
					type: 'string',
					title: '简称',
					ui: {
						optional: '中文',
						placeholder: '请输入中文展会简称',
					},
					default: this.data.record.description
						? this.data.record.description.zh
						: '',
				},
				description_en: {
					type: 'string',
					title: '简称',
					ui: {
						optional: '英文',
						placeholder: '请输入英文展会简称',
					},
					default: this.data.record.description
						? this.data.record.description.en
						: '',
				},
			},
			required: [
				'name_zh',
				'name_en',
				'description_zh',
				'description_zh',
			],
			ui: {
				spanLabelFixed: 150,
				grid: { span: 24 },
			},
		};
	}

	save(value: any) {
		this.loading = true;
		if (this.data.record.id == null) {
			this.comSrv.createExpoType(value).subscribe(
				(res: any) => {
					this.msgSrv.success('保存成功');
					this.modal.close(res);
				},
				(err: HttpErrorResponse) => {
					this.loading = false;
				},
			);
		} else {
			value.id = this.data.record.id;
			this.comSrv.updateExpoType(value).subscribe(
				(res: any) => {
					this.msgSrv.success('保存成功');
					this.modal.close(res);
				},
				(err: HttpErrorResponse) => {
					this.loading = false;
				},
			);
		}
	}

	close() {
		this.modal.destroy();
	}
}
