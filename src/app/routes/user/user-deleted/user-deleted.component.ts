import { HttpErrorResponse } from '@angular/common/http';
import {
	ChangeDetectorRef,
	Component,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { STChange, STColumn, STComponent, STData } from '@delon/abc/st';
import { ModalHelper } from '@delon/theme';
import { CommonService } from '@shared';
import { UserViewComponent } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-user-deleted',
	templateUrl: './user-deleted.component.html',
})
export class UserDeletedComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		deleted: true,
		sorter: '',
		statusList: [],
	};
	total = 0;
	list: any[] = [];
	loading = false;
	status = [];
	intention: any[];
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{ title: '', index: 'id', type: 'checkbox' },
		{
			title: '姓名',
			index: 'name',
			format: (item, _col) => `${item.name.zh || item.name.en || '-'}`,
		},
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
		{ title: '公司名称', index: 'company.company_name.en', default: '-' },
		{ title: '注册时间', type: 'date', index: 'created_at' },
		{ title: '删除时间', type: 'date', index: 'deleted_at' },
		{
			title: '操作',
			buttons: [
				{
					text: '查看',
					click: (item: any) => this.openUserView(item),
				},
				{
					text: '恢复',
					click: (item: any) => this.restore(item.id),
				},
			],
		},
	];
	selectedRows: STData[] = [];
	totalCallNo = 0;
	expandForm = false;
	countries: any[] = [];
	regions: any[] = [];
	mgmodels: any[] = [];
	commonDataSubscription: Subscription;

	constructor(
		private comSrv: CommonService,
		private cdr: ChangeDetectorRef,
		private modal: ModalHelper,
		private modalSrv: NzModalService,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.status = this.comSrv.userStatus;
		this.intention = this.comSrv.intention;
		this.commonDataSubscription = this.comSrv
			.getCommonDataUpdates()
			.subscribe((res: any) => {
				this.countries = res.countries;
				this.mgmodels = res.mgmodels;
			});
		this.getData();
	}

	ngOnDestroy() {
		this.commonDataSubscription.unsubscribe();
	}

	getData() {
		this.loading = true;
		this.queryParams.statusList = this.status
			.filter((w) => w.checked)
			.map((item) => item.index);
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});

		this.comSrv
			.getUsers({
				...this.queryParams,
			})
			.subscribe((res: any) => {
				this.loading = false;
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
		}
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

	reset() {
		// wait form reset updated finished
		setTimeout(() => this.getData());
	}

	selectCountry() {
		if (this.queryParams.country) {
			this.queryParams.region = null;
			if (this.queryParams.country === 'CHN') {
				this.regions = this.comSrv.getCommonData().chinaRegions;
			} else {
				this.regions = [];
			}
			// console.log('Selected country:', this.queryParams.country);
			// this.comSrv
			// 	.getRegions({ id: this.queryParams.country.id })
			// 	.subscribe((res: any) => {
			// 		this.regions = res.data.list;
			// 		console.log('regions:', res.data);
			// 	});
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
					this.comSrv.restoreUser(ids).subscribe(
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
}
