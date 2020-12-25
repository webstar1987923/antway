import { HttpErrorResponse } from '@angular/common/http';
import {
	ChangeDetectorRef,
	Component,
	Input,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { STChange, STColumn, STComponent, STData } from '@delon/abc/st';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonService } from '../../../services/common.service';

import * as moment from 'moment';

@Component({
	selector: 'app-contact-list',
	templateUrl: './contact-list.component.html',
})
export class ContactListComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		active: '',
		direction: '',
	};
	@Input() user;
	total = 0;
	list: any[] = [];
	loading = false;

	newContact: any = {};
	expoList: any[] = [];
	intention: any[];
	contactMethodList: any[] = [
		{ value: 1, name: '电话' },
		{ value: 2, name: '微信' },
		{ value: 3, name: '邮箱' },
	];
	contactResultList: any[] = [
		{ value: 1, name: '已联络', color: 'green' },
		{ value: 2, name: '失败', color: 'red' },
		{ value: 3, name: '待联络', color: 'blue' },
		{ value: 4, name: '不联络', color: 'grey' },
	];

	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{
			title: '展会名称',
			index: 'expo',
			format: (item, _col) => `${item.expo.name.zh || '-'}`,
		},
		{ title: '备注', index: 'description' },
		{ title: '联系方式', index: 'method' },
		{
			title: '工作人员',
			index: 'user',
			format: (item, _col) => `${item.user.name.zh || '-'}`,
		},
		{ title: '联系结果', index: 'result' },
		{
			title: '客户意向',
			index: 'intention',
			render: 'intention',
		},
		{ title: '联系时间', type: 'date', index: 'created_at' },
	];
	selectedRows: STData[] = [];
	totalCallNo = 0;

	constructor(
		private cdr: ChangeDetectorRef,
		private comSrv: CommonService,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.intention = this.comSrv.intention;
		this.getData();
		this.getExpoes();
	}

	ngOnDestroy() {}

	getData() {
		this.loading = true;
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});
		this.comSrv
			.getContacts({ ...this.queryParams, user_id: this.user.id })
			.subscribe(
				(res: any) => {
					this.loading = false;
					console.log('contact list', res);
					this.total = res.data.total;
					this.list = res.data.list;
					this.cdr.detectChanges();
				},
				(err: HttpErrorResponse) => {
					this.loading = false;
				},
			);
	}

	getExpoes() {
		this.comSrv.getExpoes().subscribe((res: any) => {
			this.expoList = res.data.list;
		});
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

	saveContact(form: any) {
		if (form.valid) {
			const postData = {
				...form.value,
				user_id: this.user.id,
			};
			this.comSrv.createContact(postData).subscribe(
				(res: any) => {
					this.loading = false;
					this.msgSrv.success(res.data.msg);
					this.getData();
					form.reset();
				},
				(err: HttpErrorResponse) => {
					this.loading = false;
				},
			);
		}
	}
}
