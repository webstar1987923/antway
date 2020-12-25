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

// Components
import { SellerViewComponent } from '@shared';
import { SellerOrderComponent } from '../seller-order/seller-order.component';
import { SellerRecommendComponent } from '../seller-recommend/seller-recommend.component';

@Component({
	selector: 'app-seller-list',
	templateUrl: './seller-list.component.html',
})
export class SellerListComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		is_recommend: 1,
		active: '',
		direction: '',
	};
	total = 0;
	list: any[] = [];
	loading = false;
	status = [];
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{
			title: '排序',
			index: 'order',
			sort: true,
		},
		{
			title: '展会名称',
			index: 'expo',
			format: (item, _col) => `${item.expo ? item.expo.name.zh : '-'}`,
		},
		{
			title: '公司名称',
			index: 'company',
			render: 'company_link',
		},
		{
			title: '参展企业负责人',
			index: 'manager',
			format: (item, _col) =>
				`${item.company.manager.name.zh || '-'} / ${
					item.company.manager.phone || '-'
				} / ${item.company.manager.email || '-'}`,
		},
		{
			title: '对接业务员',
			index: 'admin',
			format: (item, _col) =>
				`${item.admin ? item.admin.user_name : '-'}`,
		},
		{ title: '申请时间', type: 'date', index: 'created_at', sort: true },
		{
			title: '操作',
			buttons: [
				{
					text: '查看',
					click: (item: any) => this.openView(item),
				},
				{
					text: '修改排序',
					click: (item: any) => this.openCompanyOrder(item),
				},
				{
					text: '取消推荐',
					click: (item: any) => this.cancelRecommend(item.id),
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
		this.getData();
	}

	ngOnDestroy() {}

	getData() {
		this.loading = true;
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});
		this.comSrv.getExpoApplicantSellers({ ...this.queryParams }).subscribe(
			(res: any) => {
				this.loading = false;
				this.total = res.data.total;
				this.list = res.data.list;
				this.cdr.detectChanges();
			},
			(err: HttpErrorResponse) => {
				this.loading = false;
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

	openView(record: any = {}, action: string = '') {
		this.modal
			.create(SellerViewComponent, { data: { record } }, { size: 1000 })
			.subscribe((res) => {
				this.getData();
			});
	}

	openCompanyOrder(record: any = {}) {
		this.modal
			.create(SellerOrderComponent, { data: { record } }, { size: 'md' })
			.subscribe((res) => {
				this.getData();
			});
	}

	openRecommendSeller() {
		this.modal
			.create(SellerRecommendComponent, { data: {} }, { size: 'md' })
			.subscribe((res) => {
				this.getData();
			});
	}

	cancelRecommend(id: number) {
		this.modalSrv.confirm({
			nzTitle: '<strong>是否确定取消推荐<strong>',
			nzOkType: 'danger',
			nzOnOk: () => {
				const postData = {
					id,
					is_recommend: 0,
				};
				this.loading = true;
				this.comSrv.updateExpoApplicantSeller(postData).subscribe(
					(res: any) => {
						this.loading = false;
						this.getData();
					},
					(err: HttpErrorResponse) => {
						this.loading = false;
					},
				);
			},
		});
	}

	reset() {
		// wait form reset updated finished
		setTimeout(() => this.getData());
	}
}
