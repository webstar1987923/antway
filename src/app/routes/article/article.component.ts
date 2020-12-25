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
import { ArticleModalComponent } from './article-modal/article-modal.component';
import { CommentListComponent } from './comment-list/comment-list.component';

@Component({
	selector: 'app-article',
	templateUrl: './article.component.html',
})
export class ArticleComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		tag: 'article',
		not_expo_news: true,
		lang: '',
		active: '',
		direction: '',
	};
	total = 0;
	list: any[] = [];
	loading = false;
	status = [];
	categories: any[] = [];
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{ title: '', index: 'id', type: 'checkbox' },
		{
			title: '标题',
			index: 'title',
			render: 'article_link',
		},
		{
			title: '作者',
			index: 'writer',
			format: (item, _col) =>
				`${item.user_id ? item.user.name.zh || '-' : '管理员'}`,
		},
		{
			title: '收藏',
			index: 'likes',
		},
		{
			title: '点赞',
			index: 'likes',
		},
		{
			title: '评论',
			index: 'comments',
		},
		{
			title: '浏览',
			index: 'views',
		},
		{
			title: '分类',
			index: 'category',
			format: (item, _col) =>
				`${
					item.category && item.category.name
						? item.category.name.zh || '-'
						: '-'
				}`,
		},
		{ title: '发布时间', type: 'date', index: 'created_at' },
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
					text: '编辑',
					click: (item: any) => this.openModal(item),
				},
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
		this.route.queryParamMap.subscribe((params) => {
			if (params.has('writer')) {
				this.queryParams.writer = params.get('writer');
			} else {
				this.queryParams.writer = '';
			}
			this.getData();
		});
		this.status = this.comSrv.articleStatus;
		this.categories = this.comSrv.getCommonData().newsCategories;
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
				console.log('article list', res);
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
				ArticleModalComponent,
				{ data: { record } },
				{ size: 1240, includeTabs: true },
			)
			.subscribe((res) => {
				this.getData();
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
