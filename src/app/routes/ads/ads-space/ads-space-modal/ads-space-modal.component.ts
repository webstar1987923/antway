import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SFComponent, SFDateWidgetSchema, SFSchema } from '@delon/form';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
	selector: 'app-ads-space-modal',
	template: `
		<div class="modal-header">
			<div class="modal-title">
				{{ data.record.id == null ? '添加' : '修改' }}广告位
			</div>
		</div>
		<sf #sf mode="edit" [schema]="schema" button="none">
			<se-container labelWidth="120">
				<se label="位置示意图" col="1" required>
					<nz-row nzJustify="space-between">
						<nz-upload
							nz-col
							nzAccept="image/*"
							[(nzFileList)]="imageList"
							[nzFileListRender]="imageTpl"
							[nzBeforeUpload]="beforeUploadImage0"
						>
							<button nz-button>
								<i nz-icon nzType="upload"></i>
								<span>上 传</span>
							</button>
						</nz-upload>
					</nz-row>
				</se>
			</se-container>
			<div class="modal-footer">
				<button nz-button type="button" (click)="close()">取 消</button>
				<button
					nz-button
					type="submit"
					[nzType]="'primary'"
					(click)="save(sf.value)"
					[disabled]="!isValidForm()"
				>
					确 定
				</button>
			</div>

			<ng-template #imageTpl let-list>
				<div *ngFor="let item of list" class="image-upload mt-md">
					<img
						[_src]="item.url ? item.url : ''"
						error="assets/img/empty.png"
						alt="Avatar"
						style="height: 105px; width: auto;"
					/>
				</div>
			</ng-template>
		</sf>
	`,
})
export class AdsSpaceModalComponent implements OnInit {
	data: any = {};
	@ViewChild('sf', { static: false }) sf: SFComponent;
	schema: SFSchema;
	imageList: any[] = [];
	subtag = 'image';
	uid = -1; // Negative is new file, positive is uploaded file

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.schema = {
			properties: {
				name: {
					type: 'string',
					title: '名称',
					default: this.data.record.name || '',
				},
				price: {
					type: 'number',
					title: '价格',
					default: this.data.record.price || '',
				},
				description: {
					type: 'string',
					title: '说明',
					ui: {
						widget: 'textarea',
						autosize: { minRows: 2, maxRows: 6 },
					},
					default: this.data.record.description || '',
				},
			},
			required: ['name', 'price', 'description'],
			ui: {
				spanLabelFixed: 120,
				grid: { span: 24 },
			},
		};

		if (this.data.record.id) {
			this.data.record.assets.forEach((element) => {
				if (element.subtag === this.subtag) {
					this.imageList.push({
						uid: element.id,
						name: element.id + '.png',
						status: 'done',
						url: element.url,
					});
				}
			});
		}
	}

	isValidForm() {
		return (
			!!this.sf &&
			this.sf.valid &&
			this.imageList &&
			this.imageList.length
		);
	}

	beforeUploadImage0 = (file: any): boolean => {
		this.processImage(file, 0);
		return false;
	};

	processImage(file: any, idx: number) {
		this.getBase64(file).then((res: string) => {
			this.imageList = [
				{
					uid: '' + this.uid--,
					name: file.name,
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

	save(value: any) {
		const formData = new FormData();
		this.imageList.forEach((element, idx) => {
			const file = this.imageList[idx];
			if (file.uid < 0) {
				formData.append('images[]', file.originFileObj);
			}
		});
		// tslint:disable-next-line: forin
		for (const key in value) {
			formData.append(key, value[key]);
		}
		this.blkSrv.setBlockStatus(true);
		if (this.data.record.id) {
			formData.append('id', this.data.record.id);
			this.comSrv.updateAdsSpace(formData).subscribe(
				(res: any) => {
					this.blkSrv.setBlockStatus(false);
					this.msgSrv.success('保存成功');
					this.modal.close('ok');
				},
				(err: HttpErrorResponse) => {
					this.blkSrv.setBlockStatus(false);
				},
			);
		} else {
			this.comSrv.createAdsSpace(formData).subscribe(
				(res: any) => {
					this.blkSrv.setBlockStatus(false);
					this.msgSrv.success('保存成功');
					this.modal.close('ok');
				},
				(err: HttpErrorResponse) => {
					this.blkSrv.setBlockStatus(false);
				},
			);
		}
	}

	close() {
		this.modal.destroy();
	}
}
