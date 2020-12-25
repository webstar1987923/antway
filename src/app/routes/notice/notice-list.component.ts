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
import { ModalHelper } from '@delon/theme';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import * as _ from 'underscore';

import { NoticeModalComponent } from './notice-modal/notice-modal.component';

@Component({
	selector: 'app-notice-list',
	templateUrl: './notice-list.component.html',
})
export class NoticeListComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		active: '',
		direction: '',
	};
	data: any = {};
	total = 0;
	list: any[] = [];
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{ title: '', index: 'id', type: 'checkbox' },
		{
			title: '标题',
			index: 'title_en',
		},
		{ title: '未读数', index: 'unreads' },
		{ title: '发布时间', type: 'date', index: 'created_at', sort: true },
		{
			title: '操作',
			buttons: [
				{
					text: '编辑',
					click: (item: any) => this.openModal(item),
				},
				{
					text: '删除',
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
	) {}

	ngOnInit() {
		this.getData();
	}

	ngOnDestroy() {}

	getData() {
		this.blkSrv.setBlockStatus(true);
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});
		this.comSrv
			.getNotices({
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
					this.comSrv.deleteNotice(ids).subscribe(
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

	openModal(record: any = {}) {
		this.modal
			.create(NoticeModalComponent, { data: { record } }, { size: 1240 })
			.subscribe((res) => {
				this.getData();
			});
	}

	reset() {
		// wait form reset updated finished
		setTimeout(() => this.getData());
	}
}
