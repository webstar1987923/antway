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
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { EmailModalComponent } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import { CreditModalComponent } from '../credit-modal/credit-modal.component';
import { ViolationListComponent } from '../violation-list/violation-list.component';
import { ViolationModalComponent } from '../violation-modal/violation-modal.component';

@Component({
	selector: 'app-company-list',
	templateUrl: './company-list.component.html',
})
export class CompanyListComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		active: '',
		direction: '',
	};
	total = 0;
	list: any[] = [];
	status = [];
	intention: any[];
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{ title: '', index: 'id', type: 'checkbox' },
		{
			title: '公司名称',
			index: 'name',
			format: (item, _col) => `${item.name?.zh || '-'}`,
		},
		{
			title: '企业负责人',
			index: 'manager',
			format: (item, _col) =>
				`${item.manager?.name?.zh || '-'} / ${
					item.manager?.phone || '-'
				} / ${item.manager?.email || '-'}`,
		},
		{
			title: '违规次数',
			index: 'violation_count',
		},
		{ title: '信用分', index: 'credit_score' },
		{
			title: '到期时间',
			type: 'date',
			index: 'todate',
			sort: true,
			format: (item, _col) =>
				`${item.stationerylog ? item.stationerylog.todate : '-'}`,
		},
		{
			title: '企业状态',
			index: 'status_active',
			render: 'status_active',
			filter: {
				menus: this.status,
				fn: (filter: any, record: any) =>
					record.status === filter.index,
			},
		},
		{
			title: '操作',
			buttons: [
				{
					text: '跳转',
					click: (item: any) => this.openUserModal(item),
				},
				{
					text: '状态',
					children: [
						{
							text: '正常',
							iif: (item: STData) => item.status !== 0,
							click: (item: any) =>
								this.changeCompanyStatusActive(item.id, 0),
						},
						{
							text: '警告',
							iif: (item: STData) => item.status !== 1,
							click: (item: any) =>
								this.changeCompanyStatusActive(item.id, 1),
						},
						{
							text: '禁止',
							iif: (item: STData) => item.status !== 2,
							click: (item: any) =>
								this.changeCompanyStatusActive(item.id, 2),
						},
					],
				},
				{
					text: '更多',
					children: [
						{
							text: '违规处理',
							click: (item: any) => this.openViolationModal(item),
						},
						{
							text: '违规记录',
							click: (item: any) => this.openViolationList(item),
						},
						{
							text: '修改信用分',
							click: (item: any) => this.openCreditModal(item),
						},
					],
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
		private blkSrv: BlockUIService,
		private cdr: ChangeDetectorRef,
		private comSrv: CommonService,
		private modal: ModalHelper,
		private modalSrv: NzModalService,
		private msgSrv: NzMessageService,
		private route: ActivatedRoute,
		private xlsx: XlsxService,
	) {}

	ngOnInit() {
		this.status = this.comSrv.companyActiveStatus;
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
		this.blkSrv.setBlockStatus(true);
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});

		this.comSrv
			.getCompanies({
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

	openUserModal(record: any = {}) {
		// this.modal.create(UserModalComponent, { data: { record } }, { size: 'md' }).subscribe((res) => {
		// 	this.getData();
		// 	this.cdr.detectChanges();
		// });
	}

	openCreditModal(record: any = {}) {
		this.modal
			.create(CreditModalComponent, { data: { record } }, { size: 'md' })
			.subscribe((res) => {
				this.getData();
			});
	}

	openViolationModal(record: any = {}) {
		this.modal
			.create(
				ViolationModalComponent,
				{ data: { record } },
				{ size: 'md' },
			)
			.subscribe((res) => {
				this.getData();
			});
	}

	openViolationList(record: any = {}) {
		this.modal
			.create(
				ViolationListComponent,
				{ data: { record } },
				{ size: 1000 },
			)
			.subscribe((res) => {});
	}

	changeCompanyStatusActive(id: number, status_active: number) {
		this.modalSrv.confirm({
			nzTitle: `<strong>是否确定${this.status[status_active].label}<strong>`,
			nzOkType: status_active ? 'danger' : 'primary',
			nzOnOk: () => {
				this.blkSrv.setBlockStatus(true);
				const postData = {
					id,
					status_active,
				};
				this.comSrv.updateCompany(postData).subscribe(
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
			// this.comSrv
			// 	.getRegions({ id: this.queryParams.country.id })
			// 	.subscribe((res: any) => {
			// 		this.regions = res.data.list;
			// 		console.log('regions:', res.data);
			// 	});
		}
	}
}
