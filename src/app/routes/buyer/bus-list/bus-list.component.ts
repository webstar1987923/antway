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
import { ApplicantViewComponent } from '../applicant-view/applicant-view.component';

@Component({
	selector: 'app-bus-list',
	templateUrl: './bus-list.component.html',
	styleUrls: ['./bus-list.component.less'],
})
export class BusListComponent implements OnInit, OnDestroy {
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
			title: '举办名称',
			index: 'expo',
			format: (item, _col) =>
				`${
					item.expo_applicant_buyer
						? item.expo_applicant_buyer.expo.name.zh
						: '-'
				}`,
		},
		{
			title: '班次',
			index: 'bus',
			format: (item, _col) =>
				`${item.bus && item.bus.name ? item.bus.name.zh : '-'}`,
		},
		{
			title: '安排日期',
			type: 'date',
			index: 'applicant_date',
			dateFormat: 'MM/dd (E)',
			sort: true,
		},
		{
			title: '姓名',
			index: 'name',
			format: (item, _col) =>
				`${
					item.expo_applicant_buyer
						? item.expo_applicant_buyer.user.name.zh
						: '-'
				}`,
		},
		{
			title: '电话',
			index: 'mobile',
			format: (item, _col) => `${item.mobile}`,
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
			title: '操作',
			buttons: [
				{
					text: '审核通过',
					iif: (item: STData) => item.status !== 1,
					click: (item: any) => this.updateStatus(item, 1),
				},
				{
					text: '取消通过',
					iif: (item: STData) => item.status !== 2,
					click: (item: any) => this.updateStatus(item, 2),
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
		this.status = this.comSrv.expoBuyerBusStatus;
		this.resultStatus = this.comSrv.expoBuyerResultStatus;
		if (this.route.snapshot.data.filter) {
			this.queryParams.filter = this.route.snapshot.data.filter;
		}
		this.getData();
	}

	ngOnDestroy() {}

	getData() {
		this.blkSrv.setBlockStatus(true);
		this.queryParams.statusList = this.status
			.filter((w) => w.checked)
			.map((item) => item.index);
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});
		this.comSrv
			.getExpoApplicantBuyerBuses({ ...this.queryParams })
			.subscribe(
				(res: any) => {
					this.blkSrv.setBlockStatus(false);
					console.log('applicant buyer free bus list', res);
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

	remove(id?) {
		const ids = id ? id : this.selectedRows.map((i) => i.id).join(',');
		if (ids) {
			this.modalSrv.confirm({
				nzTitle: '<strong>是否确定删除<strong>',
				nzOkType: 'danger',
				nzOnOk: () => {
					this.blkSrv.setBlockStatus(true);
					this.comSrv.deleteProduct(ids).subscribe(
						() => {
							this.blkSrv.setBlockStatus(false);
							this.getData();
							this.st.clearCheck();
						},
						(err: HttpErrorResponse) => {
							this.blkSrv.setBlockStatus(false);
						},
					);
				},
			});
		} else {
			this.msgSrv.info('选择');
		}
	}

	restore(id?) {
		const ids = id ? id : this.selectedRows.map((i) => i.id).join(',');
		if (ids) {
			this.modalSrv.confirm({
				nzTitle: '<strong>是否确定恢复<strong>',
				nzOkType: 'danger',
				nzOnOk: () => {
					this.blkSrv.setBlockStatus(true);
					this.comSrv.restoreProduct(ids).subscribe(
						() => {
							this.blkSrv.setBlockStatus(false);
							this.getData();
							this.st.clearCheck();
						},
						(err: HttpErrorResponse) => {
							this.blkSrv.setBlockStatus(false);
						},
					);
				},
			});
		} else {
			this.msgSrv.error(`选择`, { nzDuration: 1000 * 3 });
		}
	}

	fetchChildren(value) {
		value.forEach((element) => {
			element.value = element.id;
			element.label = element.name.zh;
			element.parent = element.pid;
			element.isLeaf = !element.children.length;
			element.children = this.fetchChildren(element.children);
		});
		return value;
	}

	updateStatus(record: any = {}, status: number = 1) {
		this.modalSrv.confirm({
			nzTitle: `<strong>是否确定${
				status === 1 ? '审核通过' : '取消通过'
			}<strong>`,
			nzOkType: 'danger',
			nzOnOk: () => {
				this.blkSrv.setBlockStatus(true);
				this.comSrv
					.updateExpoApplicantBuyerBus({ id: record.id, status })
					.subscribe(
						(res: any) => {
							this.blkSrv.setBlockStatus(false);
							this.msgSrv.success(res.data.msg);
							this.getData();
						},
						(err: HttpErrorResponse) => {
							this.blkSrv.setBlockStatus(false);
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
