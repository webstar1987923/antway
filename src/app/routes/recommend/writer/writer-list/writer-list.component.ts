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
import { WriterOrderComponent } from '../writer-order/writer-order.component';
import { WriterRecommendComponent } from '../writer-recommend/writer-recommend.component';

@Component({
	selector: 'app-writer-list',
	templateUrl: './writer-list.component.html',
})
export class WriterListComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		filter: 'writer',
		is_recommend: 1,
		active: '',
		direction: '',
	};
	total = 0;
	list: any[] = [];
	loading = false;
	pages: any[] = [];
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[];
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
		this.pages = this.comSrv.getCommonData().newsCategories;
		this.refreshColumns();
		this.getData();
	}

	ngOnDestroy() {}

	refreshColumns() {
		this.columns = [
			{
				title: '排序',
				index: 'order',
				format: (item, _col) => `${item.writer.order || '-'}`,
				sort: true,
			},
			{
				title: '推荐页面',
				index: 'page',
				format: (item, _col) =>
					`${
						this.pages.find(
							(element) =>
								element.value === item.writer.recommend_page,
						)?.label || '-'
					}`,
			},
			{
				title: '专栏名称',
				index: 'title',
				render: 'writer_link',
			},
			{
				title: '作者',
				index: 'writer',
				format: (item, _col) =>
					`${item.name.zh || '-'} / ${item.phone || '-'} / ${
						item.email || '-'
					}`,
			},
			{
				title: '操作',
				buttons: [
					{
						text: '查看',
						click: (item: any) => this.openProductView(item),
					},
					{
						text: '修改推荐',
						click: (item: any) => this.openOrder(item),
					},
					{
						text: '取消推荐',
						click: (item: any) => this.cancelRecommend(item.id),
					},
				],
			},
		];
	}

	getData() {
		this.blkSrv.setBlockStatus(true);
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});
		this.comSrv.getUsers({ ...this.queryParams }).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				console.log('article list', res);
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

	openProductView(record: any = {}) {
		// this.modal.create(ProductViewComponent, { data: { record } }, { size: 1240, includeTabs: true }).subscribe((res) => {
		// 	this.getData();
		// });
	}

	openOrder(record: any = {}) {
		this.modal
			.create(
				WriterOrderComponent,
				{ data: { record, pages: this.pages } },
				{ size: 'md' },
			)
			.subscribe((res) => {
				this.getData();
			});
	}

	openRecommendSeller() {
		this.modal
			.create(WriterRecommendComponent, { data: {} }, { size: 'md' })
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
				this.blkSrv.setBlockStatus(true);
				this.comSrv.updateWriter(postData).subscribe(
					(res: any) => {
						this.blkSrv.setBlockStatus(false);
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
