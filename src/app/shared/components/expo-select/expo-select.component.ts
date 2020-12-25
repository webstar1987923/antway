import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';

// Delon
import { SFComponent, SFSchema, SFSelectWidgetSchema } from '@delon/form';

// Zorro
import { NzModalRef } from 'ng-zorro-antd/modal';

// Custom services
import { BlockUIService } from '../../services/block-ui.service';
import { CommonService } from '../../services/common.service';

@Component({
	selector: 'app-expo-select',
	template: `
		<div class="modal-header">
			<div class="modal-title">选择展会</div>
		</div>
		<sf #sf mode="edit" [schema]="schema" [compact]="true" button="none">
		</sf>

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
	`,
})
export class ExpoSelectComponent implements OnInit {
	data: any = {};
	@ViewChild('sf', { static: false }) sf: SFComponent;
	schema: SFSchema;
	expoes: any[] = [];

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: NzModalRef,
	) {}

	ngOnInit() {
		this.expoes = this.comSrv.getCommonData().expoes;
		this.refreshSchema();
	}

	refreshSchema() {
		this.schema = {
			properties: {
				expo_id: {
					type: 'string',
					title: '展会',
					enum: this.expoes,
					ui: {
						widget: 'select',
					} as SFSelectWidgetSchema,
				},
			},
			required: ['expo_id'],
			ui: {
				spanLabelFixed: 120,
			},
		};
	}

	save(value: any) {
		this.modal.close(value);
	}

	close() {
		this.modal.destroy();
	}
}
