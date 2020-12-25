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

@Component({
	selector: 'app-expo-modal',
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
export class ExpoModalComponent implements OnInit {
	loading = false;
	data: any = {};
	@ViewChild('sf', { static: false }) private sf: SFComponent;
	schema: SFSchema;
	status: any[];
	admins: any[] = [];

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.status = this.comSrv.expoStatus;
		this.admins = this.comSrv.getCommonData().admins;
		this.schema = {
			properties: {
				serial: {
					type: 'number',
					title: '届数',
					maxLength: 50,
					ui: {
						placeholder: '请选择届数',
					},
					default: this.data.record.serial
						? this.data.record.serial
						: '',
				},
				name_zh: {
					type: 'string',
					title: '举办名称',
					ui: {
						optional: '中文',
						placeholder: '请输入中文举办名称',
					},
					default: this.data.record.name
						? this.data.record.name.zh
						: '',
				},
				name_en: {
					type: 'string',
					title: '举办名称',
					ui: {
						optional: '英文',
						placeholder: '请输入英文举办名称',
					},
					default: this.data.record.name
						? this.data.record.name.en
						: '',
				},
				startdate: {
					type: 'string',
					title: '举办时间',
					ui: {
						widget: 'date',
						end: 'enddate',
					} as SFDateWidgetSchema,
					default: this.data.record.startdate
						? new Date(this.data.record.startdate)
						: null,
				},
				enddate: {
					type: 'string',
					ui: {
						widget: 'date',
						end: 'enddate',
					} as SFDateWidgetSchema,
					default: this.data.record.enddate
						? new Date(this.data.record.enddate)
						: '',
				},
				expo_type_id: {
					type: 'string',
					title: '展会',
					enum: this.data.expoTypes,
					ui: {
						widget: 'select',
						placeholder: '请选择展会',
					},
					default: this.data.record.expo_type_id
						? this.data.record.expo_type_id
						: '',
				},
				status: {
					type: 'string',
					title: '状态',
					enum: this.status,
					ui: {
						widget: 'select',
					},
					default: this.data.record.status
						? this.data.record.status
						: 0,
				},
				admin_id: {
					type: 'string',
					title: '管理员',
					enum: this.admins,
					ui: {
						widget: 'select',
					} as SFSelectWidgetSchema,
					default: this.data.record.admin_id || null,
				},
				hall_price: {
					type: 'number',
					title: '展位价格',
					default: this.data.record.hall_price || null,
				},
				is_menu_display: {
					type: 'boolean',
					title: '主菜单显示',
					default: this.data.record.is_menu_display,
				},
			},
			required: [
				'hall_id',
				'name_zh',
				'name_en',
				'startdate',
				'enddate',
				'expo_type_id',
				'status',
				'hall_price',
				'is_menu_display',
			],
			ui: {
				spanLabelFixed: 150,
				grid: { span: 24 },
			},
		};
	}

	save(value: any) {
		this.loading = true;
		const postData = {
			...value,
			startdate: value.startdate,
			enddate: value.enddate,
			is_only_buyer: value.is_only_buyer ? 1 : 0,
		};
		if (this.data.record.id == null) {
			this.comSrv.createExpo(postData).subscribe(
				(res: any) => {
					this.msgSrv.success('保存成功');
					this.modal.close(res);
				},
				(err: HttpErrorResponse) => {
					this.loading = false;
				},
			);
		} else {
			postData.id = this.data.record.id;
			this.comSrv.updateExpo(postData).subscribe(
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
