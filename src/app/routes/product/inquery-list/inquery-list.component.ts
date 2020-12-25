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
import { ModalHelper } from '@delon/theme';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import { InqueryViewComponent } from '../inquery-view/inquery-view.component';

@Component({
	selector: 'app-inquery-list',
	templateUrl: './inquery-list.component.html',
	styleUrls: ['./inquery-list.component.less'],
})
export class InqueryListComponent implements OnInit, OnDestroy {
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
	loading = false;
	status = [
		{
			index: 0,
			text: '未回复',
			value: false,
			color: 'grey',
			checked: false,
		},
		{
			index: 1,
			text: '已回复',
			value: false,
			color: 'green',
			checked: false,
		},
	];
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{ title: '', index: 'id', type: 'checkbox' },
		{
			title: '标题',
			index: 'title',
		},
		{
			title: '收件人',
			index: 'receiver',
			format: (item, _col) =>
				`${
					(item.receiver.name.zh || '-') +
					'<br>' +
					(item.receiver.manager.name.zh || '-')
				}`,
		},
		{
			title: '发件人',
			index: 'sender',
			format: (item, _col) =>
				`${
					(item.sender.company
						? item.sender.company.name.zh || '-'
						: '-') +
					'<br>' +
					(item.sender.name.zh || '-')
				}`,
		},
		{
			title: '询盘类型',
			index: 'urgent',
			format: (item, _col) =>
				`${item.product_id ? '产品询盘' : '公司询盘'}`,
		},
		{
			title: '询盘时间',
			type: 'date',
			index: 'created_at',
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
		{
			title: '操作',
			buttons: [
				{
					text: '详情',
					click: (item: any) => this.openInqueryView(item),
				},
				{
					text: '删除',
					iif: (item: STData) => !item.deleted_at,
					click: (item: any) => this.remove(item.id),
				},
				{
					text: '恢复',
					iif: (item: STData) => !!item.deleted_at,
					click: (item: any) => this.restore(item.id),
				},
			],
		},
	];
	selectedRows: STData[] = [];
	totalCallNo = 0;

	constructor(
		private cdr: ChangeDetectorRef,
		private comSrv: CommonService,
		private modal: ModalHelper,
		private modalSrv: NzModalService,
		private msgSrv: NzMessageService,
		private route: ActivatedRoute,
	) {}

	ngOnInit() {
		if (this.route.snapshot.data.filter) {
			this.queryParams.filter = this.route.snapshot.data.filter;
		}
		this.getData();
	}

	ngOnDestroy() {}

	getData() {
		this.loading = true;
		this.queryParams.statusList = this.status
			.filter((w) => w.checked)
			.map((item) => item.index);
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});
		this.comSrv.getInqueries({ ...this.queryParams }).subscribe(
			(res: any) => {
				this.loading = false;
				console.log('inquery list', res.data.list);
				this.total = res.data.total;
				this.list = res.data.list;
				this.list.forEach((element) => {
					element.status = 1;
				});
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

	remove(id?) {
		const ids = id ? id : this.selectedRows.map((i) => i.id).join(',');
		if (ids) {
			this.modalSrv.confirm({
				nzTitle: '<strong>是否确定删除<strong>',
				nzOkType: 'danger',
				nzOnOk: () => {
					this.loading = true;
					this.comSrv.deleteInquery(ids).subscribe(
						() => {
							this.loading = false;
							this.getData();
							this.st.clearCheck();
						},
						(err: HttpErrorResponse) => {
							this.loading = false;
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
					this.loading = true;
					this.comSrv.restoreInquery(ids).subscribe(
						() => {
							this.loading = false;
							this.getData();
							this.st.clearCheck();
						},
						(err: HttpErrorResponse) => {
							this.loading = false;
						},
					);
				},
			});
		} else {
			this.msgSrv.error(`选择`, { nzDuration: 1000 * 3 });
		}
	}

	openInqueryView(record: any = {}) {
		this.modal
			.create(InqueryViewComponent, { data: { record } }, { size: 1000 })
			.subscribe((res) => {
				this.getData();
				this.cdr.detectChanges();
			});
	}

	reset() {
		// wait form reset updated finished
		setTimeout(() => this.getData());
	}
}
