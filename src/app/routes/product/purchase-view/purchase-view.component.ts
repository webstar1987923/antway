import { HttpErrorResponse } from '@angular/common/http';
import {
	ChangeDetectorRef,
	Component,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { STChange, STColumn, STComponent, STData } from '@delon/abc/st';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-purchase-view',
	templateUrl: './purchase-view.component.html',
	styleUrls: ['./purchase-view.component.less'],
})
export class PurchaseViewComponent implements OnInit, OnDestroy {
	loading = false;
	data: any = {};
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{
			title: '报价人',
			index: 'user',
			format: (item, _col) =>
				`${item.user.name.zh || '-'} &nbsp; ${
					'+' + item.user.phone_prefix || '-'
				} &nbsp; ${item.user.phone || '-'}`,
		},
		{
			title: '报价人公司名称',
			index: 'company',
			format: (item, _col) =>
				`${
					item.user.company?.name?.zh ||
					item.user.company?.name?.en ||
					'-'
				}`,
		},
		{
			title: '现货',
			index: 'in_stock',
			format: (item, _col) => `${item.in_stock ? '有' : '没有'}`,
		},
		{
			title: '提供样品',
			index: 'can_provide_sample',
			format: (item, _col) =>
				`${item.can_provide_sample ? '是' : '不是'}`,
		},
		{
			title: 'OEM/ODM',
			index: 'is_oem',
			format: (item, _col) => `${item.is_oem ? 'OEM' : 'ODM'}`,
		},
		{
			title: '报价金额',
			index: 'price',
			format: (item, _col) => `${item.price || '-'}`,
			sort: true,
		},
		{ title: '报价时间', type: 'date', index: 'created_at', sort: true },
	];
	selectedRows: STData[] = [];
	totalCallNo = 0;

	constructor(
		private cdr: ChangeDetectorRef,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
		private sanitizer: DomSanitizer,
	) {}

	ngOnInit() {}

	ngOnDestroy() {}

	stChange(e: STChange) {
		switch (e.type) {
			case 'checkbox':
				this.selectedRows = e.checkbox;
				this.totalCallNo = this.selectedRows.reduce(
					(total, cv) => total + cv.callNo,
					0,
				);
				this.cdr.detectChanges();
				break;
			case 'filter':
				break;
			case 'pi':
				break;
			case 'ps':
				break;
			case 'sort':
				break;
		}
	}
}
