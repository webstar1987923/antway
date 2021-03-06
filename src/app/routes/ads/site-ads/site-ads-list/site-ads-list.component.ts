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
import { SiteAdsModalComponent } from '../site-ads-modal/site-ads-modal.component';

@Component({
	selector: 'app-site-ads-list',
	templateUrl: './site-ads-list.component.html',
})
export class SiteAdsListComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 10,
		active: '',
		direction: '',
	};
	total = 0;
	list: any[] = [];
	loading = false;
	siteAdsType = [];
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [];
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
		this.siteAdsType = this.comSrv.siteAdsType;
		this.columns = [
			// {
			// 	title: '客户端',
			// 	index: 'device',
			// 	format: (item, _col) =>
			// 		`${
			// 			(this.siteAdsType[item.device] &&
			// 				this.siteAdsType[item.device].label) ||
			// 			'-'
			// 		}`,
			// },
			{
				title: '展示页面',
				index: 'category',
				format: (item, _col) => `${item.category?.name?.zh || '-'}`,
			},
			{
				title: '中文广告数',
				index: 'zh_cnt',
			},
			{
				title: '英文广告数',
				index: 'en_cnt',
			},
			{
				title: '点击数',
				index: 'views',
			},
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
		this.getData();
	}

	ngOnDestroy() {}

	getData() {
		this.blkSrv.setBlockStatus(true);
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});
		this.comSrv.getSiteAdss({ ...this.queryParams }).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				console.log('Ads space list', res);
				this.total = res.data.total;
				this.list = res.data.list;
				this.list.forEach((element) => {
					element.zh_cnt = element.assets.filter(
						(item) => item.subtag === 'zh',
					).length;
					element.en_cnt = element.assets.filter(
						(item) => item.subtag === 'en',
					).length;
				});
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
					this.loading = true;
					this.comSrv.deleteSiteAds(ids).subscribe(
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

	openModal(record: any = {}) {
		this.modal
			.create(SiteAdsModalComponent, { data: { record } }, { size: 'md' })
			.subscribe((res) => {
				this.getData();
			});
	}

	reset() {
		// wait form reset updated finished
		setTimeout(() => this.getData());
	}
}
