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
import { ArticleOrderComponent } from '../article-order/article-order.component';
import { ArticleRecommendComponent } from '../article-recommend/article-recommend.component';

@Component({
	selector: 'app-article-list',
	templateUrl: './article-list.component.html',
})
export class ArticleListComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		tag: 'article',
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
			title: '头条分类',
			index: 'order',
			format: (item, _col) =>
				`${
					(item.category &&
						item.category.name &&
						item.category.name.zh) ||
					'-'
				}`,
		},
		{
			title: '标题',
			index: 'title',
			render: 'article_link',
		},
		{
			title: '作者',
			index: 'writer',
			format: (item, _col) =>
				`${item.user?.name?.zh || '-'} / ${item.user?.phone || '-'} / ${
					item.user?.email || '-'
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
		this.blkSrv.setBlockStatus(true);
		this.queryParams.statusList = this.status
			.filter((w) => w.checked)
			.map((item) => item.index);
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});
		this.comSrv.getDiscovers({ ...this.queryParams }).subscribe(
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

	openCompanyOrder(record: any = {}) {
		this.modal
			.create(ArticleOrderComponent, { data: { record } }, { size: 'md' })
			.subscribe((res) => {
				this.getData();
			});
	}

	openRecommendSeller() {
		this.modal
			.create(ArticleRecommendComponent, { data: {} }, { size: 'md' })
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
				this.comSrv.updateDiscover(postData).subscribe(
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
