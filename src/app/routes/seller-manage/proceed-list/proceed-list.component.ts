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
import { XlsxService } from '@delon/abc/xlsx';
import { ModalHelper } from '@delon/theme';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';

import * as moment from 'moment';

import { ProceedViewComponent } from '../proceed-view/proceed-view.component';

@Component({
	selector: 'app-proceed-list',
	templateUrl: './proceed-list.component.html',
})
export class ProceedListComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		tag: '2',
		active: '',
		direction: '',
	};
	total = 0;
	list: any[] = [];
	loading = false;
	status = [];
	expoes = [];
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
		private xlsx: XlsxService,
	) {}

	ngOnInit() {
		this.status = this.comSrv.expoProceedStatus;
		this.expoes = this.comSrv.getCommonData().expoes;
		this.refreshColumn();
		if (this.route.snapshot.data.filter) {
			this.queryParams.filter = this.route.snapshot.data.filter;
		}
		this.getData();
	}

	ngOnDestroy() {}

	refreshColumn() {
		this.columns = [
			{
				title: '举办名称',
				index: 'expo',
				format: (item, _col) => `${item.expo?.name?.zh || '-'}`,
				filter: {
					menus: this.expoes,
					multiple: false,
				},
			},
			{
				title: '入住企业名称',
				index: 'company',
				format: (item, _col) =>
					`${item.user?.company?.name?.zh || '-'}`,
			},
			{
				title: '参展企业负责人',
				index: 'manager',
				format: (item, _col) =>
					item.user
						? `${item.user?.name?.zh || '-'} / ${
								item.user?.phone || '-'
						  } / ${item.user?.email || '-'}`
						: '-',
			},
			{ title: '申请时间', type: 'date', index: 'created_at' },
			{
				title: '状态',
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
						text: '详情',
						click: (item: any) => this.openView(item),
					},
				],
			},
		];
	}

	getData() {
		this.loading = true;
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});
		this.comSrv.getExpoProceeds({ ...this.queryParams }).subscribe(
			(res: any) => {
				this.loading = false;
				console.log('Proceed list', res);
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
				this.queryParams[e.filter.indexKey] = e.filter.filter.menus
					.filter((w) => w.checked)
					.map((item) => item.value)
					.join(',');
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
					this.comSrv.deleteProduct(ids).subscribe(
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

	restore(id?) {
		const ids = id ? id : this.selectedRows.map((i) => i.id).join(',');
		if (ids) {
			this.modalSrv.confirm({
				nzTitle: '<strong>是否确定恢复<strong>',
				nzOkType: 'danger',
				nzOnOk: () => {
					this.loading = true;
					this.comSrv.restoreProduct(ids).subscribe(
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
			this.msgSrv.error(`选择`, { nzDuration: 1000 * 3 });
		}
	}

	fetchChildren(value) {
		value.forEach((element) => {
			element.value = element.id;
			element.label = element.name.zh;
			element.parent = element.pid;
			element.isLeaf = !element.children.length;
			element.children = this.fetchChildren(element.children);
		});
		return value;
	}

	openView(record: any = {}) {
		this.modal
			.create(ProceedViewComponent, { data: { record } }, { size: 1240 })
			.subscribe((res) => {
				this.getData();
			});
	}

	reset() {
		// wait form reset updated finished
		setTimeout(() => this.getData());
	}

	download() {
		this.modalSrv.confirm({
			nzTitle: '<strong>是否确定导出搜索结果<strong>',
			nzOnOk: () => {
				this.loading = true;
				this.comSrv
					.getExpoProceeds({
						...this.queryParams,
						pi: '',
						ps: '',
					})
					.subscribe(
						(res: any) => {
							this.loading = false;
							const data = [
								[
									'举办名称',
									'入住企业名称',
									'参展企业负责人',
									'公司名称(中文)',
									'公司名称(英文)',
									'展位号',
									'公司介绍(中文)',
									'公司介绍(英文)',
									'邮编',
									'地址(中文)',
									'地址(英文)',
									'电话',
									'传真',
									'邮箱',
									'公司网址',
									'申请时间',
									'处理状态',
								],
							];
							res.data.list.forEach((element) => {
								data.push([
									element.expo?.name?.zh || '-',
									element.user?.company?.name?.zh || '-',
									`${element.user?.name?.zh || '-'} / ${
										element.user?.phone || '-'
									} / ${element.user?.email || '-'}`,
									element.company?.zh || '-',
									element.company?.en || '-',
									element.hallname || '-',
									element.summary?.zh || '-',
									element.summary?.en || '-',
									element.contact_email || '-',
									element.contact_addr?.zh || '-',
									element.contact_addr?.en || '-',
									element.contact_phone || '-',
									element.contact_fax || '-',
									element.contact_postal || '-',
									element.contact_website || '-',
									moment(element.created_at).format(
										'YYYY/MM/DD HH:mm:ss',
									),
									this.status[element.status]?.label || '-',
								]);
							});
							this.xlsx.export({
								filename: `会刊信息.xlsx`,
								sheets: [
									{
										data,
										name: '会刊信息',
									},
								],
							});
						},
						(err: HttpErrorResponse) => {
							this.loading = false;
						},
					);
			},
		});
	}
}
