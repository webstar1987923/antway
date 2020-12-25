import { HttpErrorResponse } from '@angular/common/http';
import {
	ChangeDetectorRef,
	Component,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
	STChange,
	STColumn,
	STColumnButton,
	STComponent,
	STData,
} from '@delon/abc/st';
import { ModalHelper } from '@delon/theme';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';

import { UserViewComponent } from '@shared';

@Component({
	selector: 'app-promotion-list',
	templateUrl: './promotion-list.component.html',
})
export class PromotionListComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		filter: '',
		active: '',
		direction: '',
		statusList: [],
	};
	total = 0;
	list: any[] = [];
	status = [];
	resultStatus: any[] = [];
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{
			title: '推荐人',
			index: 'user',
			format: (item, _col) =>
				`${item.user?.name?.zh || '-'} / ${item.user?.phone || '-'} / ${
					item.user?.email || '-'
				}`,
		},
		{
			title: '联系信息',
			index: 'contact',
			format: (item, _col) => `${item.contact || '-'}`,
		},
		{
			title: '被邀请人',
			index: 'user',
			format: (item, _col) =>
				`${item.contact_user?.name?.zh || '-'} / ${
					item.contact_user?.phone || '-'
				} / ${item.contact_user?.email || '-'}`,
		},
		{
			title: '推广状态',
			index: 'status',
			render: 'status',
			filter: {
				menus: this.status,
				multiple: false,
			},
		},
		{
			title: '操作',
			buttons: [
				{
					text: '推荐人查看',
					click: (item: any) => this.openUserView(item.user),
				},
				{
					text: '被邀请人查看',
					iif: (item: STData) => item.contact_user,
					click: (item: any) => this.openUserView(item.contact_user),
				},
			],
		},
	];
	selectedRows: STData[] = [];
	totalCallNo = 0;

	constructor(
		private cdr: ChangeDetectorRef,
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: ModalHelper,
		private modalSrv: NzModalService,
		private msgSrv: NzMessageService,
		private route: ActivatedRoute,
	) {}

	ngOnInit() {
		this.status = this.comSrv.promotionStatus;
		this.resultStatus = this.comSrv.expoBuyerResultStatus;
		if (this.route.snapshot.data.filter) {
			this.queryParams.filter = this.route.snapshot.data.filter;
		}
		this.getData();
	}

	ngOnDestroy() {}

	getData() {
		this.blkSrv.setBlockStatus(true);
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});
		this.comSrv.getPromotions({ ...this.queryParams }).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				console.log('User promotion list', res.data.list);
				this.total = res.data.total;
				this.list = res.data.list;
				this.cdr.detectChanges();
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

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
				this.getData();
				break;
			case 'pi':
				this.queryParams.pi = e.pi;
				this.getData();
				break;
			case 'ps':
				this.queryParams.ps = e.ps;
				this.getData();
				break;
			case 'sort':
				this.queryParams.active = e.sort.column.indexKey || '';
				this.queryParams.direction = e.sort.value || '';
				this.getData();
				break;
		}
	}

	openUserView(record: any = {}) {
		this.modal
			.create(
				UserViewComponent,
				{ data: { record } },
				{ size: 1240, includeTabs: true },
			)
			.subscribe((res) => {
				this.getData();
			});
	}

	reset() {
		// wait form reset updated finished
		setTimeout(() => this.getData());
	}
}
