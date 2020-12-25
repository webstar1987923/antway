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
// import { ProductViewComponent } from '../product-view/product-view.component';

@Component({
	selector: 'app-hall-list',
	templateUrl: './hall-list.component.html',
	styleUrls: ['./hall-list.component.less'],
})
export class HallListComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
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
			title: '举办名称',
			index: 'expo',
			format: (item, _col) => `${item.expo?.name?.zh || '-'}`,
		},
		{
			title: '展馆',
			index: 'building',
			format: (item, _col) =>
				`${item.building?.name?.zh || item.building?.name?.en || '-'}`,
		},
		{
			title: '展位编号',
			index: 'hall',
			format: (item, _col) => `${item.map_id || '-'}`,
			sort: true,
		},
		{
			title: '入住企业名称',
			index: 'company',
			format: (item, _col) =>
				`${
					item.expo_applicant_seller_hall
						? item.expo_applicant_seller_hall.expo_applicant_seller
								.company.name.zh
						: '-'
				}`,
		},
		{
			title: '负责人电话',
			index: 'admin',
			format: (item, _col) =>
				`${
					item.expo_applicant_seller_hall
						? item.expo_applicant_seller_hall.expo_applicant_seller
								.company.manager.phone
						: '-'
				}`,
		},
		{
			title: '申请总数',
			index: 'count',
			format: (item, _col) => `${item.count ? item.count : '-'}`,
		},
		{
			title: '受保护时间',
			type: 'date',
			index: 'expo_applicant_seller_hall.created_at',
			sort: true,
		},
		{
			title: '状态',
			index: 'status',
			render: 'status',
			filter: {
				menus: this.status,
				fn: (filter: any, record: any) =>
					record.status === filter.index,
			},
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
		this.status = this.comSrv.hallStatus;
		if (this.route.snapshot.data.filter) {
			this.queryParams.filter = this.route.snapshot.data.filter;
		}
		this.getData();
	}

	ngOnDestroy() {}

	getData() {
		this.loading = true;
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});
		this.comSrv.getExpoHalls({ ...this.queryParams }).subscribe(
			(res: any) => {
				this.loading = false;
				res.data.list.forEach((element) => {
					element.status = 0;
					if (element.expo_applicant_seller_hall) {
						element.status =
							element.expo_applicant_seller_hall.status;
					}
				});
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

	reset() {
		// wait form reset updated finished
		setTimeout(() => this.getData());
	}
}
