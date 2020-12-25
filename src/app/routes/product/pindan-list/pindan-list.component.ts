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
import { PindanViewComponent } from '../pindan-view/pindan-view.component';

@Component({
	selector: 'app-pindan-list',
	templateUrl: './pindan-list.component.html',
	styleUrls: ['./pindan-list.component.less'],
})
export class PindanListComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		is_pindan: 1,
		active: '',
		direction: '',
	};
	total = 0;
	list: any[] = [];
	loading = false;
	pindanStatus = [];
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{ title: '产品', index: 'product', render: 'product' },
		{ title: '产品单价', index: 'price', type: 'currency' },
		{
			title: '供应商',
			index: 'company_user',
			render: 'supplier_link',
			format: (item, _col) =>
				`${
					(item.company ? item.company.name.zh : '-') +
					'<br>' +
					(item.user ? item.user.name.zh : '-')
				}`,
		},
		{ title: '进度', index: 'result', render: 'result' },
		{ title: '拼单时间', type: 'date', index: 'created_at', sort: true },
		{
			title: '拼单状态',
			index: 'pindan_status',
			render: 'pindan_status',
			filter: {
				menus: this.pindanStatus,
				fn: (filter: any, record: any) =>
					record.status === filter.index,
			},
		},
		{
			title: '操作',
			buttons: [
				{
					text: '拼单列表',
					click: (item: any) => this.openProductView(item),
				},
				{
					text: '取消',
					iif: (item: STData) => !item.deleted_at,
					click: (item: any) => this.remove(item.id),
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
		this.pindanStatus = this.comSrv.pindanStatus;
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
		this.comSrv.getProducts({ ...this.queryParams }).subscribe(
			(res: any) => {
				this.loading = false;
				console.log('product list', res);
				this.total = res.data.total;
				this.list = res.data.list;
				this.list.forEach((element) => {
					if (element.deleted_at) {
						element.status = 3;
					}
					element.images = element.assets.filter(
						(item) => item.subtag === 'image',
					);
					element.videos = element.assets.filter(
						(item) => item.subtag === 'video',
					);
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
					this.comSrv.deleteProduct(ids).subscribe(
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
					this.comSrv.restoreProduct(ids).subscribe(
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

	openProductView(record: any = {}, action: string = '') {
		this.modal
			.create(
				PindanViewComponent,
				{ data: { record } },
				{ size: 1240, includeTabs: true },
			)
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
