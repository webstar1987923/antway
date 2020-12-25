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
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';

import { CommentListComponent } from './comment-list/comment-list.component';
import { DiscoverModalComponent } from './discover-modal/discover-modal.component';

@Component({
	selector: 'app-discover',
	templateUrl: './discover.component.html',
})
export class DiscoverComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		tag: 'discover',
		lang: '',
		active: '',
		direction: '',
	};
	total = 0;
	list: any[] = [];
	loading = false;
	status = [];
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{ title: '', index: 'id', type: 'checkbox' },
		{
			title: '标题',
			index: 'title',
			format: (item, _col) =>
				`${
					item.title
						? item.title.length > 20
							? `${item.title.slice(0, 20)}...`
							: item.title
						: '-'
				}`,
		},
		{
			title: '作者',
			index: 'writer',
			format: (item, _col) =>
				`${item.user ? item.user.name.zh || '-' : '-'}`,
		},
		{
			title: '收藏',
			index: 'likes',
			sort: true,
		},
		{
			title: '点赞',
			index: 'likes',
			sort: true,
		},
		{
			title: '评论',
			index: 'comments',
			sort: true,
		},
		{
			title: '浏览',
			index: 'views',
			sort: true,
		},
		{ title: '发布时间', type: 'date', index: 'created_at', sort: true },
		{
			title: '处理状态',
			index: 'status',
			render: 'status',
			filter: {
				menus: this.status,
			},
		},
		{
			title: '操作',
			buttons: [
				{
					text: '更多',
					children: [
						{
							text: '查看评论',
							click: (item: any) => this.openComment(item),
						},
						{
							text: '分享链接',
							click: (item: any) => this.openComment(item),
						},
						{
							text: '删除',
							click: (item: any) => this.remove(item.id),
						},
					],
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
		this.status = this.comSrv.discoverStatus;
		this.getData();
	}

	ngOnDestroy() {}

	getData() {
		this.loading = true;
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});
		this.comSrv.getDiscovers({ ...this.queryParams }).subscribe(
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

	remove(id?) {
		const ids = id ? id : this.selectedRows.map((i) => i.id).join(',');
		if (ids) {
			this.modalSrv.confirm({
				nzTitle: '<strong>是否确定删除<strong>',
				nzOkType: 'danger',
				nzOnOk: () => {
					this.loading = true;
					this.comSrv.deleteDiscover(ids).subscribe(
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

	openModal(record: any = {}) {
		this.modal
			.create(
				DiscoverModalComponent,
				{ data: { record } },
				{ size: 1240, includeTabs: true },
			)
			.subscribe((res) => {
				this.getData();
				this.cdr.detectChanges();
			});
	}

	openComment(record: any = {}) {
		this.modal
			.create(CommentListComponent, { data: { record } }, { size: 1240 })
			.subscribe((res) => {});
	}

	reset() {
		// wait form reset updated finished
		setTimeout(() => this.getData());
	}
}
