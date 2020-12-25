import { HttpErrorResponse } from '@angular/common/http';
import {
	ChangeDetectorRef,
	Component,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { STChange, STColumn, STComponent, STData } from '@delon/abc/st';
import { XlsxService } from '@delon/abc/xlsx';
import { ModalHelper } from '@delon/theme';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';

import { EmailTemplateModalComponent } from '../email-template-modal/email-template-modal.component';

@Component({
	selector: 'app-email-template',
	templateUrl: './email-template.component.html',
})
export class EmailTemplateComponent implements OnInit, OnDestroy {
	queryParams: any = {};
	list: any[] = [];
	loading = false;
	expoBuyerStatus = [];
	vipStatus = [];

	constructor(
		private cdr: ChangeDetectorRef,
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: ModalHelper,
		private modalSrv: NzModalService,
		private msgSrv: NzMessageService,
		private route: ActivatedRoute,
		private xlsx: XlsxService,
	) {}

	ngOnInit() {
		this.expoBuyerStatus = this.comSrv.expoBuyerStatus;
		this.vipStatus = this.comSrv.vipStatus;
		this.getData();
	}

	ngOnDestroy() {}

	getData() {
		this.loading = true;
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});

		this.comSrv
			.getEmailTemplates({
				...this.queryParams,
			})
			.subscribe(
				(res: any) => {
					this.loading = false;
					this.list = res.data.list;
					this.cdr.detectChanges();
				},
				(err: HttpErrorResponse) => {
					this.loading = false;
				},
			);
	}

	openModal(record: any = {}) {
		this.modal
			.create(
				EmailTemplateModalComponent,
				{ data: { record } },
				{ size: 1240 },
			)
			.subscribe((res) => {
				this.getData();
			});
	}
}
