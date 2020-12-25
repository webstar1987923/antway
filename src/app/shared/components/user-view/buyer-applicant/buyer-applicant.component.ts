import { HttpErrorResponse } from '@angular/common/http';
import {
	ChangeDetectorRef,
	Component,
	Input,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { STChange, STColumn, STComponent, STData } from '@delon/abc/st';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BlockUIService } from '../../../services/block-ui.service';
import { CommonService } from '../../../services/common.service';

@Component({
	selector: 'app-buyer-applicant',
	templateUrl: './buyer-applicant.component.html',
})
export class BuyerApplicantComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		active: '',
		direction: '',
	};
	@Input() user;
	total = 0;
	list: any[] = [];
	loading = false;
	status = [];
	resultStatus: any[] = [];
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{
			title: '举办名称',
			index: 'expo',
			format: (item, _col) => `${item.expo ? item.expo.name.zh : '-'}`,
		},
		{
			title: '编号',
			index: 'numbering',
			format: (item, _col) => `${item.numbering ? item.numbering : '-'}`,
		},
		{
			title: '参观者',
			index: 'user',
			format: (item, _col) =>
				`${item.user ? item.user.name.zh : '-'} / ${
					item.user ? item.user.phone : '-'
				} / ${item.user ? item.user.email : '-'}`,
		},
		{
			title: '邀请人数',
			index: 'friends',
			format: (item, _col) => `${item.friends.length}`,
		},
		{ title: '申请时间', type: 'date', index: 'created_at', sort: true },
		{
			title: '处理状态',
			index: 'status',
			render: 'status',
			filter: {
				menus: this.status,
				fn: (filter: any, record: any) =>
					record.status === filter.index,
			},
		},
		{
			title: '参观状态',
			index: 'is_visited',
			render: 'resultStatus',
			filter: {
				menus: this.resultStatus,
				fn: (filter: any, record: any) =>
					record.status === filter.index,
			},
		},
	];
	selectedRows: STData[] = [];
	totalCallNo = 0;

	constructor(
		private blkSrv: BlockUIService,
		private cdr: ChangeDetectorRef,
		private comSrv: CommonService,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.status = this.comSrv.expoBuyerStatus;
		this.resultStatus = this.comSrv.expoBuyerResultStatus;
		this.getData();
	}

	ngOnDestroy() {}

	getData() {
		// this.blkSrv.setBlockStatus(true);
		this.loading = true;
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});
		this.comSrv
			.getExpoApplicantBuyers({
				...this.queryParams,
				user_id: this.user.id,
			})
			.subscribe(
				(res: any) => {
					// this.blkSrv.setBlockStatus(false);
					this.loading = false;
					this.total = res.data.total;
					this.list = res.data.list;
					this.cdr.detectChanges();
				},
				(err: HttpErrorResponse) => {
					// this.blkSrv.setBlockStatus(false);
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
}
