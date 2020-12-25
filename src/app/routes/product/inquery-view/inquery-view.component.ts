import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-inquery-view',
	templateUrl: './inquery-view.component.html',
	styleUrls: ['./inquery-view.component.less'],
})
export class InqueryViewComponent implements OnInit, OnDestroy {
	loading = false;
	data: any = {};

	constructor(
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
		private sanitizer: DomSanitizer,
	) {}

	ngOnInit() {
		this.data.record.threads = [
			{
				...this.data.record,
				content: this.data.record.description,
			},
		].concat(this.data.record.threads);
		if (this.data.record.product) {
			this.data.record.product.images = [];
			this.data.record.product.videos = [];
			this.data.record.product.assets.forEach((element) => {
				if (element.subtag === 'image') {
					this.data.record.product.images.push({
						uid: element.id,
						name: element.id + '.png',
						status: 'done',
						url: element.url,
					});
				} else if (element.subtag === 'video') {
					this.data.record.product.videos.push({
						uid: element.id,
						name: element.id + '.png',
						status: 'done',
						url: element.url,
						thumbUrl: 'assets/img/video.png',
					});
				}
			});
		}
	}

	ngOnDestroy() {}
}
