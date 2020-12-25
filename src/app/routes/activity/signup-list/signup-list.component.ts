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
	selector: 'app-signup-list',
	templateUrl: './signup-list.component.html',
})
export class SignupListComponent implements OnInit, OnDestroy {
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
		{
			title: '用户名',
			index: 'name',
			format: (item, _col) =>
				`${item.user.name ? item.user.name.zh : '-'}`,
		},
		{
			title: '手机号',
			index: 'phone',
			format: (item, _col) =>
				`${item.user.phone ? item.user.phone : '-'}`,
		},
		{ title: '报名人数', index: 'signup_count' },
		{ title: '报名时间', type: 'date', index: 'created_at' },
		{ title: '报名详情', index: 'signup_names' },
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
			.getActivitySignups({
				...this.queryParams,
				activity_id: this.data.record.id,
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
					.getActivitySignups({
						...this.queryParams,
						activity_id: this.data.record.id,
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
