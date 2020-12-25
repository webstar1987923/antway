import { HttpErrorResponse } from '@angular/common/http';
import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	ElementRef,
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
import { SFComponent, SFSchema, SFSelectWidgetSchema } from '@delon/form';
import { ModalHelper } from '@delon/theme';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import { InviteViewComponent } from '../invite-view/invite-view.component';

@Component({
	selector: 'app-invite-setting',
	templateUrl: './invite-setting.component.html',
	styles: [
		`
			.image-upload img {
				height: 300px;
				width: 300px;
			}
		`,
	],
})
export class InviteSettingComponent implements OnInit, OnDestroy {
	setting: any = {};
	@ViewChild('sf', { static: false }) sf: SFComponent;
	schema: SFSchema;
	imageList: any[] = [];
	subtagList: any[] = ['invite_card'];
	uid = -1; // Negative is new file, positive is uploaded file
	previewImage: string | undefined = '';
	previewImageVisible = false;
	companies: any[] = [];

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
		this.schema = {
			properties: {
				color: {
					type: 'string',
					format: 'color',
					title: '背景颜色',
				},
			},
			required: ['color'],
			ui: {
				spanLabelFixed: 120,
			},
		};
		this.getData();
	}

	ngOnDestroy() {}

	getData() {
		this.blkSrv.setBlockStatus(true);
		this.comSrv.getSettingInviteCard({}).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				console.log('Invite card setting', res);
				this.setting = res.data.list;
				this.subtagList.forEach((element, idx) => {
					const assetIdx = this.setting.color.assets.findIndex(
						(item) => item.subtag === element,
					);
					if (assetIdx > -1) {
						this.imageList[idx] = [
							{
								uid:
									'' + this.setting.color.assets[assetIdx].id,
								name: 'image.png',
								status: 'done',
								url: this.setting.color.assets[assetIdx].url,
							},
						];
					}
				});
				this.sf.schema.properties.color.default = this.setting.color
					? this.setting.color.value
					: null;
				this.sf.refreshSchema();
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	beforeUploadImage0 = (file: any): boolean => {
		this.processImage(file, 0);
		return false;
	};

	processImage(file: any, idx: number) {
		this.getBase64(file).then((res: string) => {
			this.imageList[idx] = [
				{
					uid: '' + this.uid--,
					name: 'image.png',
					status: 'done',
					url: res,
					originFileObj: file,
				},
			];
		});
	}

	getBase64(file: any): Promise<string | ArrayBuffer | null> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result.toString());
			reader.onerror = (error) => reject(error);
		});
	}

	isValidForm() {
		return (
			!!this.sf &&
			this.sf.valid &&
			this.imageList[0] &&
			this.imageList[0].length
		);
	}

	save(value: any) {
		const formData = new FormData();
		this.imageList.forEach((element: any, idx: number) => {
			// Use file name to carry individual subtag
			const file = element[0];
			if (file.uid < 0) {
				formData.append(
					'images[]',
					file.originFileObj,
					this.subtagList[idx] +
						'.' +
						file.originFileObj.name.split('.').pop(),
				);
			}
		});
		formData.append('color', value.color);
		this.blkSrv.setBlockStatus(true);
		this.comSrv.updateSettingInviteCard(formData).subscribe(
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
