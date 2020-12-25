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
import { XlsxService } from '@delon/abc/xlsx';
import { ModalHelper } from '@delon/theme';
import { CommonService } from '@shared';
import { EmailModalComponent } from '@shared';
import { UserModalComponent } from '@shared';
import { UserViewComponent } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import { ActivityModalComponent } from '../activity-modal/activity-modal.component';
import { ActivityVideoComponent } from '../activity-video/activity-video.component';
import { CommentListComponent } from '../comment-list/comment-list.component';
import { SignupListComponent } from '../signup-list/signup-list.component';

@Component({
	selector: 'app-activity-list',
	templateUrl: './activity-list.component.html',
})
export class ActivityListComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		tag: 'activity',
		with_expo: false,
		status: '',
		sorter: '',
	};
	total = 0;
	list: any[] = [];
	loading = false;
	status = [];
	activityType = [];
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{ title: '', index: 'id', type: 'checkbox' },
		{
			title: '活动标题',
			index: 'title',
			render: 'activity_link',
		},
		{
			title: '活动地点',
			index: 'address',
			format: (item, _col) => `${item.address.zh || '-'}`,
		},
		{
			title: '活动类型',
			index: 'subtag',
			render: 'subtag',
			filter: {
				menus: this.activityType,
				fn: (filter: any, record: any) =>
					record.subtag === filter.value,
			},
		},
		{
			title: '报名截止日期',
			type: 'date',
			dateFormat: 'YYY/MM/dd',
			index: 'signupdate',
		},
		{
			title: '活动日期',
			type: 'date',
			index: 'enddate',
			format: (item, _col) =>
				`${(item.startdate || '-') + ' ~ ' + (item.enddate || '-')}`,
		},
		{
			title: '报名人数',
			index: 'signups',
		},
		{ title: '添加时间', type: 'date', index: 'created_at' },
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
							text: '报名列表',
							click: (item: any) => this.openSignup(item),
						},
						{
							text: '查看评论',
							click: (item: any) => this.openComment(item),
						},
						{
							text: '精彩回放',
							click: (item: any) => this.openVideo(item),
						},
						{
							text: '删除活动',
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
		private comSrv: CommonService,
		private modal: ModalHelper,
		private modalSrv: NzModalService,
		private msgSrv: NzMessageService,
		private route: ActivatedRoute,
		private xlsx: XlsxService,
	) {}

	ngOnInit() {
		this.status = this.comSrv.userStatus;
		this.activityType = this.comSrv.activityType;
		if (this.route.snapshot.data.status) {
			this.queryParams.status = this.route.snapshot.data.status;
		}
		this.getData();
	}

	ngOnDestroy() {}

	getData() {
		this.loading = true;
		const queryParams: any = {};
		Object.entries(this.queryParams).forEach(([key, value]) => {
			if (key === 'date') {
				if (value) {
					queryParams.startdate = new Date(value[0]).getTime() / 1000;
					queryParams.enddate = new Date(value[1]).getTime() / 1000;
				}
			} else {
				queryParams[key] = value || '';
			}
		});

		this.comSrv
			.getDiscovers({
				...queryParams,
			})
			.subscribe(
				(res: any) => {
					this.loading = false;
					this.total = res.data.total;
					this.list = res.data.list;
					this.list.forEach((element) => {
						element.subtag = element.subtag === 'online' ? 0 : 1;
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

	openView(record: any = {}) {
		this.modal
			.create(
				UserViewComponent,
				{ data: { record } },
				{ size: 1240, includeTabs: true },
			)
			.subscribe((res) => {
				this.getData();
			});
	}

	openModal(record: any = {}) {
		this.modal
			.create(
				ActivityModalComponent,
				{ data: { record } },
				{ size: 1200 },
			)
			.subscribe((res) => {
				this.getData();
			});
	}

	openSignup(record: any = {}) {
		this.modal
			.create(SignupListComponent, { data: { record } }, { size: 1240 })
			.subscribe((res) => {});
	}

	openComment(record: any = {}) {
		this.modal
			.create(CommentListComponent, { data: { record } }, { size: 1240 })
			.subscribe((res) => {});
	}

	openVideo(record: any = {}) {
		this.modal
			.create(
				ActivityVideoComponent,
				{ data: { record } },
				{ size: 1240 },
			)
			.subscribe((res) => {});
	}

	reset() {
		// wait form reset updated finished
		setTimeout(() => this.getData());
	}
}
