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
import { ModalHelper } from '@delon/theme';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import { InviteViewComponent } from '../invite-view/invite-view.component';

@Component({
	selector: 'app-invite-list',
	templateUrl: './invite-list.component.html',
})
export class InviteListComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		filter: '',
		active: '',
		direction: '',
		statusList: [],
	};
	total = 0;
	list: any[] = [];
	status = [];
	resultStatus: any[] = [];
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{
			title: '公司名称',
			index: 'company',
			format: (item, _col) =>
				`${
					item.user && item.user.company
						? item.user.company.name.zh || '-'
						: '-'
				}`,
		},
		{
			title: '企业负责人',
			index: 'manager',
			format: (item, _col) =>
				item.user && item.user.company && item.user.company.manager
					? `${item.user.company.manager.name.zh || '-'} / ${
							item.user.company.manager.phone || '-'
					  } / ${item.user.company.manager.email || '-'}`
					: '-',
		},
		{
			title: '浏览次数',
			index: 'views',
			format: (item, _col) => `${item.views}`,
		},
		{
			title: '注册人数',
			index: 'invite_count',
			format: (item, _col) => `${item.views}`,
		},
		{
			title: '操作',
			buttons: [
				{
					text: '注册详情',
					click: (item: any) => this.openInviteMembers(item),
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
		this.status = this.comSrv.expoBuyerStatus;
		this.resultStatus = this.comSrv.expoBuyerResultStatus;
		if (this.route.snapshot.data.filter) {
			this.queryParams.filter = this.route.snapshot.data.filter;
		}
		this.getData();
	}

	ngOnDestroy() {}

	getData() {
		this.blkSrv.setBlockStatus(true);
		this.queryParams.statusList = this.status
			.filter((w) => w.checked)
			.map((item) => item.index);
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});
		this.comSrv.getUserShares({ ...this.queryParams }).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				console.log('User invite list', res);
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
				nzOkType: 'danger',
				nzOnOk: () => {
					this.blkSrv.setBlockStatus(true);
					this.comSrv.deleteProduct(ids).subscribe(
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
					this.comSrv.restoreProduct(ids).subscribe(
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

	openInviteMembers(record: any = {}, action: string = '') {
		this.modal
			.create(InviteViewComponent, { data: { record } }, { size: 1240 })
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
