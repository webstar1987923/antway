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
import { STChange, STColumn, STComponent, STData } from '@delon/abc/st';
import { XlsxService } from '@delon/abc/xlsx';
import { ModalHelper } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { CommonService } from '../../../services/common.service';

import { EmailModalComponent } from '../../email-modal/email-modal.component';
import { UserModalComponent } from '../../user-modal/user-modal.component';
import { UserViewComponent } from '../../user-view/user-view.component';
import { MemberBindingComponent } from '../member-binding/member-binding.component';

@Component({
	selector: 'app-member-list',
	templateUrl: './member-list.component.html',
})
export class MemberListComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		active: '',
		direction: '',
	};
	@Input() company;
	total = 0;
	list: any[] = [];
	loading = false;
	status = [];
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{ title: '', index: 'id', type: 'checkbox' },
		{ title: '姓名', index: 'name.en', render: 'name' },
		{
			title: '邮箱',
			index: 'email',
			format: (item, _col) => `${item.email || '-'}`,
		},
		{
			title: '手机号',
			index: 'phone',
			format: (item, _col) =>
				`${(item.phone_prefix || '') + (item.phone || '-')}`,
		},
		{ title: '职务', index: 'company.name.zh', default: '-' },
		{
			title: '状态',
			index: 'status',
			render: 'status',
			filter: {
				menus: this.status,
				fn: (filter: any, record: any) =>
					record.status === filter.index,
			},
		},
		{ title: '注册时间', type: 'date', index: 'created_at' },
		{
			title: '操作',
			buttons: [
				{
					text: '查看',
					click: (item: any) => this.openUserView(item),
				},
				{
					text: '更多',
					children: [
						{
							text: '重置密码',
							click: (item: any) =>
								this.openUserModal(item, 'resetPassword'),
						},
						{
							text: '发送邮件',
							click: (item: any) =>
								this.openEmailModal(item.email),
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
		this.getData();
	}

	ngOnDestroy() {}

	getData() {
		this.loading = true;
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});
		this.comSrv
			.getUsers({ ...this.queryParams, company_id: this.company.id })
			.subscribe(
				(res: any) => {
					this.loading = false;
					console.log('user list', res);
					this.total = res.data.total;
					this.list = res.data.list;
					this.list.forEach((element) => {
						element.status = 0;
						if (element.status_verified === 2) {
							if (element.stationery) {
								element.status = 4;
							} else if (element.vip) {
								element.status = 3;
							} else {
								element.status = 1;
							}
						}
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
				nzContent: '删除后就无法挽回咯~',
				nzOkType: 'danger',
				nzOnOk: () => {
					this.loading = true;
					this.comSrv.deleteUser(ids).subscribe(
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

	download() {
		this.modalSrv.confirm({
			nzTitle: '<strong>是否确定导出搜索结果<strong>',
			nzOnOk: () => {
				this.loading = true;
				this.comSrv
					.getUsers({
						...this.queryParams,
						country: this.queryParams.country
							? this.queryParams.country.code
							: '',
						pi: '',
						ps: '',
					})
					.subscribe(
						(res: any) => {
							this.loading = false;
							const data = [
								[
									'公司负责人',
									'邮箱',
									'手机号',
									'公司名称',
									'到期时间',
								],
							];
							this.list.forEach((element) => {
								element.status = 0;
								if (element.status_verified === 2) {
									if (element.stationery) {
										element.status = 4;
									} else if (element.vip) {
										element.status = 3;
									} else {
										element.status = 1;
									}
								}
								data.push([
									element.name.zh,
									element.email,
									element.phone,
									element.company.name.zh,
									element.created_at,
								]);
							});
							this.xlsx.export({
								filename: `文具通会员.xlsx`,
								sheets: [
									{
										data,
										name: '文具通会员',
									},
								],
							});
							this.cdr.detectChanges();
						},
						(err: HttpErrorResponse) => {
							this.loading = false;
						},
					);
			},
		});
	}

	openUserView(record: any = {}) {
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

	openUserModal(record: any = {}, action: string = '') {
		this.modal
			.create(
				UserModalComponent,
				{ data: { record, action, company_id: this.company.id } },
				{ size: 'md' },
			)
			.subscribe((res) => {
				this.getData();
				this.cdr.detectChanges();
			});
	}

	openMemberBinding() {
		this.modal
			.create(
				MemberBindingComponent,
				{
					data: {
						record: this.company,
					},
				},
				{ size: 'md' },
			)
			.subscribe(() => {
				this.getData();
			});
	}

	openEmailModal(email: string = '') {
		const emails = email
			? email
			: this.selectedRows.map((i) => i.email).join(',');
		this.modal
			.create(
				EmailModalComponent,
				{ data: { record: { to: emails } } },
				{ size: 900 },
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
