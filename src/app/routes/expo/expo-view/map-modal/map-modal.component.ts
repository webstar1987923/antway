import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

// Delon
import { SFComponent, SFSchema, SFSelectWidgetSchema } from '@delon/form';

// Zorro
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzUploadFile } from 'ng-zorro-antd/upload';

// Custom services
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';

// Plugins
import * as _ from 'underscore';

@Component({
	selector: 'app-map-modal',
	templateUrl: './map-modal.component.html',
})
export class MapModalComponent implements OnInit, OnDestroy {
	data: any = {};

	mapList: any[] = [];
	uid = -1; // Negative is new file, positive is uploaded file

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {}

	ngOnDestroy() {}

	isValidForm() {
		return this.mapList[0]?.length && this.mapList[1]?.length;
	}

	beforeUploadJs = (file: any): boolean => {
		this.processFile(file, 0);
		return false;
	};

	beforeUploadBg = (file: any): boolean => {
		this.processFile(file, 1);
		return false;
	};

	processFile(file: any, idx: number) {
		this.getBase64(file).then((res: string) => {
			console.log(file);
			this.mapList[idx] = [
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

	save() {
		const formData = new FormData();
		let file = this.mapList[0][0];
		formData.append(
			'hall_json[]',
			file.originFileObj,
			this.data.record.map_id +
				'.' +
				file.originFileObj.name.split('.').pop(),
		);
		file = this.mapList[1][0];
		formData.append(
			'hall_bg[]',
			file.originFileObj,
			this.data.record.map_id +
				'.' +
				file.originFileObj.name.split('.').pop(),
		);
		formData.append('id', this.data.record.expo_id);
		this.blkSrv.setBlockStatus(true);
		this.comSrv.updateExpo(formData).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.msgSrv.success(res.data.msg);
				this.modal.close(res.data.rlt);
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	close() {
		this.modal.destroy();
	}
}
