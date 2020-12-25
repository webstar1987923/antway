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
import { EmailModalComponent } from '@shared';
import { UserViewComponent } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-system-list',
	templateUrl: './system-list.component.html',
})
export class SystemListComponent implements OnInit, OnDestroy {
	queryParams: any = {};
	originList: any[] = [];
	list: any[] = [];
	loading = false;
	expoBuyerChecked = [];
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
		this.expoBuyerChecked = this.comSrv.expoBuyerChecked;
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
			.getSystemSetting({
				...this.queryParams,
			})
			.subscribe(
				(res: any) => {
					this.loading = false;
					this.originList = res.data.list;
					this.refresh();
					this.cdr.detectChanges();
				},
				(err: HttpErrorResponse) => {
					this.loading = false;
				},
			);
	}

	refresh() {
		this.list = JSON.parse(JSON.stringify(this.originList));
	}

	save(value) {
		const postData = {
			id: value.id || null,
			tag: value.tag,
			value: value.value,
		};

		this.blkSrv.setBlockStatus(true);
		this.comSrv.updateSystemSetting(postData).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.getData();
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}
}
