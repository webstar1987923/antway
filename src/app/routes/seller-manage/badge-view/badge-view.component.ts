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
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import * as _ from 'underscore';

@Component({
	selector: 'app-badge-view',
	templateUrl: './badge-view.component.html',
})
export class BadgeViewComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		active: '',
		direction: '',
	};
	data: any = {};
	total = 0;
	list: any[] = [];
	status = [];
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{ title: '举办名称', index: 'expo.name.zh', default: '-' },
		{
			title: '姓名',
			index: 'name',
			format: (item, _col) => `${item.name ? item.name.zh : '-'}`,
		},
		{
			title: '职务',
			index: 'position',
			format: (item, _col) => `${item.position ? item.position.zh : '-'}`,
		},
		{
			title: '公司名称',
			index: 'company',
			format: (item, _col) => `${item.company ? item.company.zh : '-'}`,
		},
		{
			title: '手机号',
			index: 'mobile',
			format: (item, _col) => `${item.mobile || '-'}`,
		},
		{
			title: '展位号',
			index: 'hallname',
			format: (item, _col) => `${item.hallname || '-'}`,
		},
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
		this.getData();
	}

	ngOnDestroy() {}

	getData() {
		this.blkSrv.setBlockStatus(true);
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});
		this.comSrv
			.getExpoBadges({
				...this.queryParams,
				expo_id: this.data.record.expo_id,
				user_id: this.data.record.user_id,
			})
			.subscribe(
				(res: any) => {
					this.blkSrv.setBlockStatus(false);
					console.log('Badge list', res);
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

	reset() {
		// wait form reset updated finished
		setTimeout(() => this.getData());
	}

	saveStatus(form: any) {
		if (form.valid) {
			const postData = JSON.parse(JSON.stringify(form.value));
			postData.ids = _.pluck(this.list, 'id').join(',');
			this.blkSrv.setBlockStatus(true);
			this.comSrv.changeBadgeStatus(postData).subscribe(
				(res: any) => {
					this.blkSrv.setBlockStatus(false);
					this.msgSrv.success(res.data.msg);
					this.getData();
				},
				(err: HttpErrorResponse) => {
					this.blkSrv.setBlockStatus(false);
				},
			);
		}
	}

	download() {
		this.modalSrv.confirm({
			nzTitle: '<strong>是否确定导出搜索结果<strong>',
			nzOnOk: () => {
				this.blkSrv.setBlockStatus(true);
				this.comSrv
					.getExpoBadges({
						...this.queryParams,
						expo_id: this.data.record.expo_id,
						user_id: this.data.record.user_id,
						pi: '',
						ps: '',
					})
					.subscribe(
						(res: any) => {
							this.blkSrv.setBlockStatus(false);
							const data = [
								[
									'姓名',
									'职务',
									'公司名称',
									'手机号',
									'展位号',
								],
							];
							res.data.list.forEach((element) => {
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
									element.name ? element.name.zh : '-',
									element.position
										? element.position.zh
										: '-',
									element.company ? element.company.zh : '-',
									element.mobile ? element.mobile : '-',
									element.hallname ? element.hallname : '-',
								]);
							});
							this.xlsx.export({
								filename: `证件申请.xlsx`,
								sheets: [
									{
										data,
										name: '证件申请',
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
