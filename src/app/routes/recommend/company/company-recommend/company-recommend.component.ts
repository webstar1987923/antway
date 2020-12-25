import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SFComponent, SFDateWidgetSchema, SFSchema } from '@delon/form';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

// Constants
import { CompanyStatusCst } from '@shared';

@Component({
	selector: 'app-company-recommend',
	template: `
		<div class="modal-header">
			<div class="modal-title">添加推荐企业</div>
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
					nzPlaceHolder="请选择企业"
					nzAllowClear
					nzShowSearch
					nzServerSearch
					[ngModel]="me.formProperty.value"
					(ngModelChange)="me.setValue($event)"
					(nzOnSearch)="getData($event)"
				>
					<ng-container *ngFor="let o of list">
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
					(click)="save(sf.value)"
					[disabled]="!sf.valid"
				>
					确 定
				</button>
			</div>
		</sf>
	`,
})
export class CompanyRecommendComponent implements OnInit {
	isLoading = false;
	data: any = {};
	@ViewChild('sf', { static: false }) sf: SFComponent;
	schema: SFSchema;
	list: any[] = [];
	dataSubject = new Subject();

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
					title: '企业',
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
		this.getData();

		this.dataSubject.pipe(debounceTime(1000)).subscribe((searchText) => {
			this.isLoading = true;
			this.comSrv
				.getCompanies({
					is_recommend: 0,
					company_name: searchText,
					status: CompanyStatusCst.COMPANY_VERIFIED,
					pi: 1,
					ps: 10,
				})
				.subscribe(
					(res: any) => {
						this.isLoading = false;
						this.list = [];
						res.data.list.forEach((element) => {
							this.list.push({
								value: element.id,
								label: element.name.zh,
							});
						});
					},
					(err: HttpErrorResponse) => {
						this.isLoading = false;
					},
				);
		});
	}

	getData(searchText: string = '') {
		this.dataSubject.next(searchText);
	}

	save(value: any) {
		this.blkSrv.setBlockStatus(true);
		this.comSrv.recommendCompanies(value.ids.join(',')).subscribe(
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
