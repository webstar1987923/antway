import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SFComponent, SFDateWidgetSchema, SFSchema } from '@delon/form';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
	selector: 'app-writer-recommend',
	template: `
		<div class="modal-header">
			<div class="modal-title">
				添加推荐专栏
			</div>
		</div>
		<sf #sf mode="edit" [schema]="schema" button="none">
			<ng-template
				sf-template="ids"
				let-me
				let-ui="ui"
				let-schema="schema"
			>
				<nz-select
					nzMode="multiple"
					nzPlaceHolder="请选择专栏"
					nzAllowClear
					nzShowSearch
					nzServerSearch
					[ngModel]="me.formProperty.value"
					(ngModelChange)="me.setValue($event)"
					(nzOnSearch)="getWriters($event)"
				>
					<ng-container *ngFor="let o of writers">
						<nz-option
							*ngIf="!isLoading"
							[nzValue]="o.value"
							[nzLabel]="o.label"
						></nz-option>
					</ng-container>
					<nz-option *ngIf="isLoading" nzDisabled nzCustomContent>
						<i nz-icon nzType="loading" class="loading-icon"></i>
						加载数据中...
					</nz-option>
				</nz-select>
			</ng-template>
			<div class="modal-footer">
				<button nz-button type="button" (click)="close()">取 消</button>
				<button
					nz-button
					type="submit"
					[nzType]="'primary'"
					[nzLoading]="isLoading"
					(click)="save(sf.value)"
					[disabled]="!sf.valid"
				>
					确 定
				</button>
			</div>
		</sf>
	`,
})
export class WriterRecommendComponent implements OnInit {
	isLoading = false;
	data: any = {};
	@ViewChild('sf', { static: false }) sf: SFComponent;
	schema: SFSchema;
	writers: any[] = [];

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.schema = {
			properties: {
				ids: {
					type: 'string',
					title: '专栏',
					ui: {
						widget: 'custom',
					},
				},
			},
			required: ['ids'],
			ui: {
				spanLabelFixed: 100,
				grid: { span: 24 },
			},
		};
	}

	getWriters(value: string = ''): void {
		this.isLoading = true;
		this.comSrv
			.getWriters({ is_recommend: 0, name: value, pi: 1, ps: 10 })
			.subscribe(
				(res: any) => {
					this.isLoading = false;
					this.writers = [];
					res.data.list.forEach((element) => {
						this.writers.push({
							value: element.id,
							label: element.writer.name.zh || '-',
						});
					});
				},
				(err: HttpErrorResponse) => {
					this.isLoading = false;
				},
			);
	}

	save(value: any) {
		this.blkSrv.setBlockStatus(true);
		this.comSrv.recommendWriters(value.ids.join(',')).subscribe(
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

	close() {
		this.modal.destroy();
	}
}
