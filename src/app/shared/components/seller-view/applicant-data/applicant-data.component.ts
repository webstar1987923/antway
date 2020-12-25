import { HttpErrorResponse } from '@angular/common/http';
import {
	ChangeDetectorRef,
	Component,
	Input,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {
	SFCascaderWidgetSchema,
	SFComponent,
	SFRadioWidgetSchema,
	SFSchema,
	SFSchemaEnum,
	SFSelectWidgetSchema,
	SFTextWidgetSchema,
	SFTreeSelectWidgetSchema,
} from '@delon/form';
import { ModalHelper } from '@delon/theme';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import * as _ from 'underscore';

// Constants
import { TransactionType } from '../../../constants/transaction-type.constant';

// Models
import { Transaction } from '../../../models/transaction.model';

// Components
import { PayModalComponent } from '../../pay-modal/pay-modal.component';

// Custom services
import { BlockUIService } from '../../../services/block-ui.service';
import { CommonService } from '../../../services/common.service';

@Component({
	selector: 'app-applicant-data',
	templateUrl: './applicant-data.component.html',
})
export class ApplicantDataComponent implements OnInit, OnDestroy {
	@Input() data: any = {};
	expoSellerChecked: any[] = [];
	halls: any[] = [];
	categories: any[] = [];
	areaTypes: any[] = [];
	admins: any[] = [];
	calcPrice = 0;

	@ViewChild('sf', { static: false }) sf: SFComponent;
	schema: SFSchema;

	constructor(
		private cdr: ChangeDetectorRef,
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modalHelper: ModalHelper,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
		private sanitizer: DomSanitizer,
	) {}

	ngOnInit() {
		this.expoSellerChecked = this.comSrv.expoSellerChecked;

		this.calcPrice = this.data.record.halls.reduce((acc, val) => {
			return acc + (val.price || 0);
		}, 0);

		this.categories = this.comSrv.getCommonData().productCategories;
		this.admins = this.comSrv.getCommonData().admins;
		this.areaTypes = this.comSrv.getCommonData().areaTypes;

		this.refreshSchema();

		this.blkSrv.setBlockStatus(true);
		this.comSrv
			.getAvailableExpoHalls({
				expo_id: this.data.record.expo_id,
				expo_applicant_seller_id: this.data.record.id,
			})
			.subscribe(
				(res: any) => {
					this.blkSrv.setBlockStatus(false);
					this.halls = [];
					res.data.list.forEach((element) => {
						// const temp: SFSchemaEnum;
						this.halls.push({
							label: element.map_id || '-',
							value: element.id,
							otherData: element,
						});
					});
					this.schema.properties.halls.enum = this.halls;
					this.sf.refreshSchema();
				},
				(err: HttpErrorResponse) => {
					this.blkSrv.setBlockStatus(false);
				},
			);
	}

	ngOnDestroy() {}

	refreshSchema() {
		this.schema = {
			properties: {
				company_link: {
					type: 'string',
					title: '公司名称',
					ui: {
						widget: 'custom',
						grid: {
							span: 12,
						},
					},
				},
				user: {
					type: 'string',
					title: '申请人',
					ui: {
						widget: 'text',
						defaultText: this.data.record.user.name
							? (this.data.record.user.name.zh || '-') +
							  ', ' +
							  (this.data.record.user.name.en || '-')
							: '',
						grid: {
							span: 12,
						},
					} as SFTextWidgetSchema,
				},
				leader_name: {
					type: 'string',
					title: '展会负责人',
					ui: {
						grid: {
							span: 6,
						},
					},
					default: this.data.record.leader_name
						? this.data.record.leader_name
						: '',
				},
				leader_gender: {
					type: 'string',
					title: '',
					enum: this.comSrv.gender.zh,
					ui: {
						widget: 'radio',
						grid: {
							span: 12,
						},
					} as SFRadioWidgetSchema,
					default: this.data.record.leader_gender || 0,
				},
				leader_phone: {
					type: 'string',
					title: '手机',
					ui: {
						grid: {
							span: 6,
						},
					},
					default: this.data.record.leader_phone
						? this.data.record.leader_phone
						: '',
				},
				leader_position: {
					type: 'string',
					title: '职务',
					default: this.data.record.leader_position
						? this.data.record.leader_position
						: '',
				},
				admin_checked: {
					type: 'string',
					title: '处理状态',
					ui: {
						widget: 'custom',
					},
					default: this.data.record.admin_checked,
				},
				// admin_checked: {
				// 	type: 'string',
				// 	title: '处理状态',
				// 	enum: this.expoSellerChecked,
				// 	ui: {
				// 		widget: 'select',
				// 	} as SFSelectWidgetSchema,
				// 	default: this.data.record.admin_checked,
				// },
				halls: {
					type: 'string',
					title: '参展展位',
					enum: this.halls,
					ui: {
						widget: 'select',
						mode: 'tags',
						change: (value, orgData) => {
							this.calcPrice = this.halls
								.filter((element) =>
									value.some(
										(item) => item === element.value,
									),
								)
								.reduce((acc, val) => {
									return acc + (val.otherData?.price || 0);
								}, 0);
						},
						grid: {
							span: 20,
						},
					} as SFSelectWidgetSchema,
					default: _.pluck(this.data.record.halls, 'id'),
				},
				calcPrice: {
					type: 'string',
					title: '计算金额',
					ui: {
						widget: 'custom',
						grid: {
							span: 4,
						},
						spanLabelFixed: 100,
					},
				},
				areatype_id: {
					type: 'string',
					title: '展位类型',
					enum: this.areaTypes,
					ui: {
						widget: 'select',
						grid: {
							span: 12,
						},
					} as SFSelectWidgetSchema,
					default: this.data.record.areatype_id
						? this.data.record.areatype_id
						: null,
				},
				area: {
					type: 'string',
					title: '特装面积',
					ui: {
						grid: {
							span: 8,
						},
					},
					default: this.data.record.area ? this.data.record.area : '',
				},
				categories: {
					type: 'string',
					title: '参展产品',
					enum: this.categories,
					ui: {
						widget: 'tree-select',
						multiple: true,
					} as SFTreeSelectWidgetSchema,
					default: _.pluck(this.data.record.categories, 'id'),
				},
				amount: {
					type: 'string',
					title: '展位总价格',
					ui: {
						widget: 'custom',
						grid: {
							span: 12,
						},
					},
					readOnly: !!this.data.record.transaction,
					default: this.data.record.amount || null,
				},
				payStatus: {
					type: 'string',
					title: '支付状态',
					ui: {
						widget: 'custom',
						grid: {
							span: 12,
						},
					},
				},
				is_sit: {
					type: 'boolean',
					title: '是否参展',
					ui: {
						widget: 'checkbox',
						change: (value) => {
							this.changeSitStatus(value);
						},
					} as SFCascaderWidgetSchema,
					default: !!this.data.record.is_sit,
				},
				created_at: {
					type: 'string',
					title: '申请时间',
					ui: {
						widget: 'text',
						defaultText: this.data.record.created_at
							? moment(this.data.record.created_at).format(
									'YYYY/MM/DD HH:mm:ss',
							  )
							: '',
						grid: {
							span: 12,
						},
					} as SFTextWidgetSchema,
				},
				admin_id: {
					type: 'string',
					title: '对接业务员',
					enum: this.admins,
					ui: {
						widget: 'select',
						grid: {
							span: 12,
						},
					} as SFSelectWidgetSchema,
					default: this.data.record.admin_id
						? this.data.record.admin_id
						: null,
				},
			},
			ui: {
				spanLabelFixed: 140,
				grid: {
					span: 24,
				},
				size: 'small',
			},
		};
	}

	getData() {
		this.blkSrv.setBlockStatus(true);
		this.comSrv.getExpoApplicantSeller(this.data.record.id).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.data.record = res.data;
				this.refreshSchema();
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	isValidForm() {
		return !!this.sf && this.sf.valid;
	}

	changeSitStatus(is_sit) {
		this.blkSrv.setBlockStatus(true);
		const postData = {
			id: this.data.record.id,
			is_sit,
		};
		console.log(postData);
		this.comSrv.updateExpoApplicantSeller(postData).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.msgSrv.success(res.data.msg);
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	save(value: any = {}) {
		// Check amount validation
		if (value.admin_checked === 1 && !value.amount) {
			this.msgSrv.error('请输入展位总价格');
		} else {
			this.blkSrv.setBlockStatus(true);
			value.id = this.data.record.id;
			this.comSrv.updateExpoApplicantSeller(value).subscribe(
				(res: any) => {
					this.blkSrv.setBlockStatus(false);
					this.msgSrv.success(res.data.msg);
					this.modal.close(res);
				},
				(err: HttpErrorResponse) => {
					this.blkSrv.setBlockStatus(false);
				},
			);
		}
	}

	openPayModal() {
		const transaction = new Transaction({
			amount: this.sf.value.amount,
			user_id: this.data.record.user_id,
			contact:
				this.data.record.user.email ||
				this.data.record.user.phone ||
				null,
			type: TransactionType.SELLER_APPLICANT,
			description: `申请参展(${
				this.data.record.expo.name.zh ||
				this.data.record.expo.name.en ||
				'-'
			})`,
			status: 1,
		});
		this.modalHelper
			.create(
				PayModalComponent,
				{
					data: {
						record: transaction,
						seller_id: this.data.record.id,
					},
				},
				{ size: 'md' },
			)
			.subscribe((res) => {
				this.data.record.transaction = res.data.transaction;
				this.cdr.detectChanges();
			});
	}

	close() {
		this.modal.destroy('Ok');
	}
}
