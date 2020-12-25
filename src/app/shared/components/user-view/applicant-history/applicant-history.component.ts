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
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';

import { BlockUIService } from '../../../services/block-ui.service';
import { CommonService } from '../../../services/common.service';

import * as _ from 'underscore';

@Component({
	selector: 'app-applicant-history',
	templateUrl: './applicant-history.component.html',
})
export class ApplicantHistoryComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		company_id: '',
		active: '',
		direction: '',
	};
	@Input() company;
	total = 0;
	list: any[] = [];
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{
			title: '举办名称',
			index: 'expo',
			format: (item, _col) => `${item.expo ? item.expo.name.zh : '-'}`,
		},
		{
			title: '展位号',
			index: 'halls',
			format: (item, _col) => {
				const halls = _.pluck(item.halls, 'name').join(',');
				return halls.length > 30 ? `${halls.slice(0, 20)}...` : halls;
			},
		},
		{
			title: '参展人数',
			index: 'badges',
			format: (item, _col) => `${item.badges ? item.badges : '-'}`,
		},
		{
			title: '负责人',
			index: 'company',
			format: (item, _col) =>
				`${item.company ? item.company.manager.name.zh : '-'}`,
		},
		{
			title: '电话',
			index: 'company',
			format: (item, _col) =>
				`${item.company ? item.company.manager.phone : '-'}`,
		},
		{ title: '报名时间', type: 'date', index: 'created_at' },
		{
			title: '操作',
			buttons: [
				{
					text: '查看问答',
					click: (item: any) => this.openView(item),
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
		this.queryParams.company_id = this.company.id;
		this.getData();
	}

	ngOnDestroy() {}

	getData() {
		this.blkSrv.setBlockStatus(true);
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});
		this.comSrv.getExpoApplicantSellers({ ...this.queryParams }).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				console.log('applicant seller list', res);
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

	openView(record: any = {}) {
		// this.modal
		// 	.create(
		// 		ApplicantViewComponent,
		// 		{ data: { record } },
		// 		{ size: 1000 },
		// 	)
		// 	.subscribe((res) => {
		// 		this.getData();
		// 	});
	}
}
