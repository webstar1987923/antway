import { HttpErrorResponse } from '@angular/common/http';
import {
	ChangeDetectorRef,
	Component,
	Input,
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
import { XlsxService } from '@delon/abc/xlsx';
import { ModalHelper } from '@delon/theme';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import * as _ from 'underscore';

@Component({
	selector: 'app-comment-list',
	templateUrl: './comment-list.component.html',
})
export class CommentListComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		filter: '',
		active: '',
		direction: '',
	};
	data: any = {};
	total = 0;
	list: any[] = [];
	status = [];
	discoverType = {
		article: {
			value: 'article',
			label: '头条',
			color: 'green',
			checked: false,
		},
		discover: {
			value: 'discover',
			label: '发现',
			color: 'red',
			checked: false,
		},
		activity: {
			value: 'activity',
			label: '活动',
			color: 'red',
			checked: false,
		},
	};
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{
			title: '分类',
			index: 'tag',
			format: (item, _col) =>
				`${this.discoverType[item.discover?.tag]?.label || '-'}`,
		},
		{
			title: '标题',
			index: 'title',
			render: 'discover_link',
			format: (item, _col) => {
				const title =
					item.discover?.tag === 'activity'
						? item.discover?.title.zh
						: item.discover?.title;
				return `${
					title
						? title.length > 20
							? `${title.slice(0, 20)}...`
							: title
						: '-'
				}`;
			},
		},
		{
			title: '用户名',
			index: 'name',
			format: (item, _col) => `${item.user?.name?.zh || '-'}`,
		},
		{
			title: '评论内容',
			index: 'comment',
			format: (item, _col) => `${item.comment ? item.comment : '-'}`,
		},
		{ title: '点赞数', index: 'likes' },
		{ title: '评论时间', type: 'date', index: 'created_at' },
		{
			title: '操作',
			buttons: [
				{
					text: '回复',
					iif: (item: STData) => item.deleted_at,
					click: (item: any) => this.restore(item.id),
				},
				{
					text: '删除',
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
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: ModalHelper,
		private modalSrv: NzModalService,
		private msgSrv: NzMessageService,
		private route: ActivatedRoute,
		private xlsx: XlsxService,
	) {}

	ngOnInit() {
		this.status = this.comSrv.expoBadgeStatus;
		if (this.route.snapshot.data.filter) {
			this.queryParams.filter = this.route.snapshot.data.filter;
		}
		this.getData();
	}

	ngOnDestroy() {}

	getData() {
		this.blkSrv.setBlockStatus(true);
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});
		this.comSrv
			.getDiscoverComments({
				...this.queryParams,
			})
			.subscribe(
				(res: any) => {
					this.blkSrv.setBlockStatus(false);
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
				nzContent: '删除后就无法挽回咯~',
				nzOkType: 'danger',
				nzOnOk: () => {
					this.blkSrv.setBlockStatus(true);
					this.comSrv.deleteDiscoverComment(ids).subscribe(
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
					this.comSrv.restoreDiscoverComment(ids).subscribe(
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

	reset() {
		// wait form reset updated finished
		setTimeout(() => this.getData());
	}

	download() {
		this.modalSrv.confirm({
			nzTitle: '<strong>是否确定导出搜索结果<strong>',
			nzOnOk: () => {
				this.blkSrv.setBlockStatus(true);
				this.comSrv
					.getDiscoverComments({
						...this.queryParams,
						discover_id: this.data.record.id,
						pi: '',
						ps: '',
					})
					.subscribe(
						(res: any) => {
							this.blkSrv.setBlockStatus(false);
							const data = [
								[
									'用户名',
									'手机号',
									'报名人数',
									'报名时间',
									'报名详情',
								],
							];
							res.data.list.forEach((element) => {
								data.push([
									element.user.name
										? element.user.name.zh
										: '-',
									element.user.phone
										? element.user.phone
										: '-',
									element.signup_count || '0',
									moment(element.created_at).format(
										'YYYY/MM/DD HH:mm:ss',
									),
									element.signup_names || '-',
								]);
							});
							this.xlsx.export({
								filename: `报名列表.xlsx`,
								sheets: [
									{
										data,
										name: '报名列表',
									},
								],
							});
						},
						(err: HttpErrorResponse) => {
							this.blkSrv.setBlockStatus(false);
						},
					);
			},
		});
	}
}
